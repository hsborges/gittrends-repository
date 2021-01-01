import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isoWeek from 'dayjs/plugin/isoWeek';
import knex from '@gittrends/database-config';

import { FastifyInstance } from 'fastify';
import { Repository, IRepository, Stargazer, IStargazer } from '@gittrends/database-config';

dayjs.extend(utc);
dayjs.extend(isoWeek);

interface IParams {
  owner: string;
  name: string;
}

type TimeSeries = Array<{ week: number; stargazers_count: number }>;

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Params: IParams }>('/:owner/:name/stargazers', async function (request, reply) {
    const repo: IRepository = await Repository.query()
      .where('name_with_owner', 'ilike', `${request.params.owner}/${request.params.name}`)
      .first('id');

    if (!repo) return reply.callNotFound();

    const timeseries: TimeSeries = await Stargazer.query()
      .select(
        knex.raw("date_trunc('week', starred_at) as week"),
        knex.raw('count(*) as stargazers_count')
      )
      .where({ repository: repo.id })
      .groupBy('week')
      .orderBy('week', 'asc');

    if (timeseries.length === 0) reply.send({ timeseries });

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
        (timeseries, record) => ({
          ...timeseries,
          [dayjs.utc(record.week).endOf('isoWeek').format('YYYY-MM-DD')]: record.stargazers_count
        }),
        {}
      ),
      first,
      last
    });
  });
}
