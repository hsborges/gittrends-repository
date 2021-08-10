/*
 *  Author: Hudson S. Borges
 */
import actor from './actor';

import consola from 'consola';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';

import { join } from 'path';
import { get } from 'lodash';
import { Actor, Repository, IStargazer, Stargazer } from '@gittrends/database-config';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(utc);

export default async function (name_with_owner: string, writer: WriterFunction) {
  const repo = await Repository.collection.findOne(
    { name_with_owner },
    { projection: { _id: 1, _metadata: 1 } }
  );

  if (!repo) throw new Error(`Repository "${name_with_owner}" not found!`);

  if (!get(repo, '_metadata.stargazers.updatedAt'))
    throw new Error(`Stargazers from "${name_with_owner}" are not updated!`);

  const timeseries = await Stargazer.collection
    .aggregate([
      { $match: { '_id.repository': repo._id } },
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

  let [[first], [last]] = await Promise.all([
    Stargazer.collection
      .aggregate([
        { $match: { '_id.repository': repo._id } },
        { $sort: { '_id.starred_at': 1 } },
        { $limit: 1 },
        { $project: { _id: 0, user: '$_id.user', starred_at: '$_id.starred_at' } }
      ])
      .toArray(),
    Stargazer.collection
      .aggregate([
        { $match: { '_id.repository': repo._id } },
        { $sort: { '_id.starred_at': -1 } },
        { $limit: 1 },
        { $project: { _id: 0, user: '$_id.user', starred_at: '$_id.starred_at' } }
      ])
      .toArray()
  ]);

  const [firstActor, lastActor] = [first, last].map((data) => data.user);

  [first, last] = await Promise.all(
    [first, last].map((data) =>
      Actor.collection
        .findOne({ _id: data.user }, { projection: { _id: 0, name: 1, login: 1, avatar_url: 1 } })
        .then((result) => ({ ...data, user: result }))
    )
  );

  const object = {
    timeseries: timeseries.reduce(
      (timeseries, record) => ({
        ...timeseries,
        [dayjs.utc().year(record.year).week(record.week).endOf('week').format('YYYY-MM-DD')]:
          record.stargazers_count
      }),
      {}
    ),
    first,
    last
  };

  await Promise.all([actor(firstActor as string, writer), actor(lastActor as string, writer)])
    .catch(consola.warn)
    .finally(() => writer(object, join(...name_with_owner.split('/'), 'stargazers.json')));
}
