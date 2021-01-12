import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isoWeek from 'dayjs/plugin/isoWeek';

import { FastifyInstance } from 'fastify';
import knex, { Repository, IRepository, Stargazer, IStargazer } from '@gittrends/database-config';

dayjs.extend(utc);
dayjs.extend(isoWeek);

interface IParams {
  owner: string;
  name: string;
}

type TimeSeries = Array<{ week: number; year: number; stargazers_count: number }>;

function getDateOfWeek(w: number, y: number): Date {
  const simple = new Date(y, 0, 1 + (w - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}

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

    const timeseries: TimeSeries = await Stargazer.query()
      .select(
        knex.raw('weekofyear(starred_at) as week'),
        knex.raw('year(starred_at) as year'),
        knex.raw('count(*) as stargazers_count')
      )
      .where({ repository: repo.id })
      .groupBy('year', 'week')
      .orderBy('year', 'asc')
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
          [dayjs(getDateOfWeek(record.week, record.year))
            .endOf('isoWeek')
            .format('YYYY-MM-DD')]: record.stargazers_count
        }),
        {}
      ),
      first,
      last
    });
  });
}
