/*
 *  Author: Hudson S. Borges
 */
import { Tag as MongoTag } from '@gittrends/database-config';

export type Tag = {
  id: string;
  name: string;
  committed_date: Date;
  additions: number;
  deletions: number;
  changed_files: number;
};

export default async function (id: string): Promise<Tag[]> {
  return MongoTag.collection
    .aggregate<Tag>([
      { $match: { repository: id } },
      { $lookup: { from: 'commits', localField: 'target', foreignField: '_id', as: 'commit' } },
      { $unwind: { path: '$commit' } },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          committed_date: '$commit.committed_date',
          additions: '$commit.additions',
          deletions: '$commit.deletions',
          changed_files: '$commit.changed_files'
        }
      }
    ])
    .toArray();
}
