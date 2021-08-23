/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';
import { join } from 'path';
import { Repository, Tag } from '@gittrends/database-config';

export default async function (name_with_owner: string) {
  const repo = await Repository.collection.findOne(
    { name_with_owner },
    { projection: { _id: 1, _metadata: 1 } }
  );

  if (!repo) throw new Error(`Repository "${name_with_owner}" not found!`);

  if (!get(repo, '_metadata.tags.updatedAt'))
    throw new Error(`Tags from "${name_with_owner}" are not updated!`);

  return await Tag.collection
    .aggregate([
      { $match: { repository: repo._id } },
      { $lookup: { from: 'commits', localField: 'target', foreignField: '_id', as: 'commit' } },
      { $unwind: { path: '$commit' } },
      {
        $project: {
          _id: 0,
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
