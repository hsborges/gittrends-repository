/*
 *  Author: Hudson S. Borges
 */
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';

import { get } from 'lodash';
import { FastifyInstance } from 'fastify';
import { Repository, IRepository, Stargazer, IStargazer, Actor } from '@gittrends/database-config';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(utc);

interface IParams {
  owner: string;
  name: string;
}

interface IQuerystring {
  since?: string;
}

type TimeSeries = Array<{ week: number; year: number; stargazers_count: number }>;

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Params: IParams; Querystring: IQuerystring }>(
    '/:owner/:name/stargazers',
    async function (request, reply) {
      const repo: IRepository | null = await Repository.collection.findOne(
        { name_with_owner: new RegExp(`^${request.params.owner}/${request.params.name}$`, 'i') },
        { projection: { _id: 1, _metadata: 1 } }
      );

      if (!repo || !get(repo, '_metadata.stargazers.updatedAt')) return reply.callNotFound();

      const since = request.query.since ? dayjs.utc(request.query.since) : null;

      const timeseries = await Stargazer.collection
        .aggregate([
          { $match: { '_id.repository': repo._id } },
          ...(since && since.isValid()
            ? [{ $match: { '_id.starred_at': { $gte: since.toDate() } } }]
            : []),
          {
            $project: {
              _id: 0,
              week: { $isoWeek: '$_id.starred_at' },
              year: { $isoWeekYear: '$_id.starred_at' }
            }
          },
          { $group: { _id: { year: '$year', week: '$week' }, stargazers_count: { $sum: 1 } } },
          { $project: { _id: 0, year: '$_id.year', week: '$_id.week', stargazers_count: 1 } },
          { $sort: { year: 1, week: 1 } }
        ])
        .toArray();

      if (timeseries.length === 0) return reply.send({ timeseries, first: null, last: null });

      let [first, last]: [IStargazer, IStargazer] = await Promise.all([
        Stargazer.collection.findOne(
          {
            '_id.repository': repo._id,
            ...(since && since.isValid() ? { '_id.starred_at': { $gte: since.toDate() } } : {})
          },
          {
            sort: { '_id.starred_at': 1 },
            projection: { _id: 0, user: '$_id.user', starred_at: '$_id.starred_at' }
          }
        ),
        Stargazer.collection.findOne(
          { '_id.repository': repo._id },
          {
            sort: { '_id.starred_at': 1 },
            projection: { _id: 0, user: '$_id.user', starred_at: '$_id.starred_at' }
          }
        )
      ]);

      [first, last] = await Promise.all(
        [first, last].map((data) =>
          Actor.collection.findOne({ _id: data.user }).then((result) => ({ ...data, user: result }))
        )
      );

      return reply.send({
        timeseries: timeseries.reduce(
          (
            timeseries: TimeSeries,
            record: { year: number; week: number; stargazers_count: number }
          ) => ({
            ...timeseries,
            [dayjs
              .utc()
              .year(record.year)
              .week(record.week)
              .endOf('week')
              .format('YYYY-MM-DD')]: record.stargazers_count
          }),
          {}
        ),
        first,
        last
      });
    }
  );
}
