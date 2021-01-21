import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';

import { FastifyInstance } from 'fastify';
import knex, {
  Repository,
  IRepository,
  Stargazer,
  IStargazer,
  Metadata
} from '@gittrends/database-config';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(utc);

interface IParams {
  owner: string;
  name: string;
}

type TimeSeries = Array<{ week: number; year: number; stargazers_count: number }>;

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Params: IParams }>('/:owner/:name/stargazers', async function (request, reply) {
    const repo: IRepository = await Repository.query()
      .where(
        knex.raw('lower(name_with_owner)'),
        'like',
        `${request.params.owner}/${request.params.name}`
      )
      .first('id');

    if (!repo) return reply.callNotFound();

    const updated = await Metadata.query()
      .where({ id: repo.id, resource: 'stargazers', key: 'updatedAt' })
      .count({ count: 'id' })
      .first();

    if (!updated || !updated.count) return reply.callNotFound();

    const timeseries = await Stargazer.query()
      .select(
        knex.raw('yearweek(starred_at) as yearweek'),
        knex.raw('count(*) as stargazers_count')
      )
      .where({ repository: repo.id })
      .groupBy('yearweek')
      .orderBy('yearweek', 'asc');

    if (timeseries.length === 0) reply.send({ timeseries, first: null, last: null });

    const [first, last]: [IStargazer, IStargazer] = await Promise.all([
      Stargazer.query()
        .where({ repository: repo.id })
        .orderBy('starred_at', 'asc')
        .first('user', 'starred_at')
        .select('user', 'starred_at'),

      Stargazer.query()
        .where({ repository: repo.id })
        .orderBy('starred_at', 'desc')
        .first('user', 'starred_at')
        .select('user', 'starred_at')
    ]);

    return reply.send({
      timeseries: timeseries.reduce(
        (timeseries: TimeSeries, record: { yearweek: string; stargazers_count: number }) => ({
          ...timeseries,
          [dayjs
            // .utc(getDateOfWeek(record.week, record.year))
            .utc()
            .year(parseInt(`${record.yearweek}`.slice(0, 4), 10))
            .week(parseInt(`${record.yearweek}`.slice(-2), 10))
            .endOf('week')
            .format('YYYY-MM-DD')]: record.stargazers_count
        }),
        {}
      ),
      first,
      last
    });
  });
}
