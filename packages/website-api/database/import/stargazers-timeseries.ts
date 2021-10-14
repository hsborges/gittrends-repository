/*
 *  Author: Hudson S. Borges
 */
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { get } from 'lodash';

import * as MongoModels from '@gittrends/database-config';

import { Stargazer, StargazerTimeseries } from '../../models';
import actor from './actor';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(utc);

export default async function (
  id: string
): Promise<[StargazerTimeseries[], Stargazer | null, Stargazer | null]> {
  const repo = await MongoModels.Repository.collection.findOne(
    { _id: id },
    { projection: { _id: 1, name_with_owner: 1, _metadata: 1 } }
  );

  if (!repo) throw new Error(`Repository "${id}" not found!`);

  if (!get(repo, '_metadata.stargazers.updatedAt'))
    throw new Error(`Stargazers from "${repo.name_with_owner}" are not updated!`);

  const timeseries = await MongoModels.Stargazer.collection
    .aggregate([
      { $match: { '_id.repository': repo._id } },
      {
        $project: {
          _id: 0,
          date: { $dateToString: { timezone: 'UTC', format: '%Y-%m-%d', date: '$_id.starred_at' } }
        }
      },
      { $group: { _id: '$date', stargazers_count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
    .map((doc) => new StargazerTimeseries({ ...doc, date: new Date(`${doc._id}T00:00:00.000Z`) }))
    .toArray();

  if (!timeseries) return [[], null, null];

  const [first, last] = await Promise.all([
    MongoModels.Stargazer.collection
      .aggregate([
        { $match: { '_id.repository': repo._id } },
        { $sort: { '_id.starred_at': 1 } },
        { $limit: 1 },
        { $project: { _id: 0, user: '$_id.user', starred_at: '$_id.starred_at' } }
      ])
      .next()
      .then(
        async (doc) =>
          doc &&
          new Stargazer({ user: await actor(doc.user), starred_at: doc.starred_at, type: 'first' })
      ),
    MongoModels.Stargazer.collection
      .aggregate([
        { $match: { '_id.repository': repo._id } },
        { $sort: { '_id.starred_at': -1 } },
        { $limit: 1 },
        { $project: { _id: 0, user: '$_id.user', starred_at: '$_id.starred_at' } }
      ])
      .next()
      .then(
        async (doc) =>
          doc &&
          new Stargazer({ user: await actor(doc.user), starred_at: doc.starred_at, type: 'last' })
      )
  ]);

  return [timeseries, first, last];
}
