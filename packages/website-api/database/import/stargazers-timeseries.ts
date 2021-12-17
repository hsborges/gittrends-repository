/*
 *  Author: Hudson S. Borges
 */
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import { StargazerRepository } from '@gittrends/database';

import { Stargazer, StargazerTimeseries } from '../types';
import importActor from './actor';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(utc);

export default async function (
  id: string
): Promise<[StargazerTimeseries[], Stargazer | null, Stargazer | null]> {
  const timeseries = await StargazerRepository.collection
    .aggregate([
      { $match: { '_id.repository': id } },
      {
        $project: {
          _id: 0,
          date: { $dateToString: { timezone: 'UTC', format: '%Y-%m-%d', date: '$_id.starred_at' } }
        }
      },
      { $group: { _id: '$date', stargazers_count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
    .map((doc) => ({
      date: new Date(`${doc._id}T00:00:00.000Z`),
      stargazers_count: doc.stargazers_count
    }))
    .toArray();

  if (!(timeseries || []).length) return [[], null, null];

  const [first, last] = await Promise.all([
    StargazerRepository.collection
      .aggregate([
        { $match: { '_id.repository': id } },
        { $sort: { '_id.starred_at': 1 } },
        { $limit: 1 },
        { $project: { _id: 0, user: '$_id.user', starred_at: '$_id.starred_at' } }
      ])
      .next()
      .then(async (doc) => {
        if (!doc) return null;
        return {
          user: await importActor(doc.user),
          starred_at: doc.starred_at,
          type: 'first'
        } as Stargazer;
      }),
    StargazerRepository.collection
      .aggregate([
        { $match: { '_id.repository': id } },
        { $sort: { '_id.starred_at': -1 } },
        { $limit: 1 },
        { $project: { _id: 0, user: '$_id.user', starred_at: '$_id.starred_at' } }
      ])
      .next()
      .then(async (doc) => {
        if (!doc) return null;
        return {
          user: await importActor(doc.user),
          starred_at: doc.starred_at,
          type: 'last'
        } as Stargazer;
      })
  ]);

  return [timeseries, first, last];
}
