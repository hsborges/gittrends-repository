/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { Repository as MongoRepo, Tag as MongoTag } from '@gittrends/database-config';

import { Tag } from '../../models';

export default async function (id: string): Promise<Tag[]> {
  const repo = await MongoRepo.collection.findOne(
    { _id: id },
    { projection: { _id: 1, name_with_owner: 1, _metadata: 1 } }
  );

  if (!repo) throw new Error(`Repository "${id}" not found!`);

  if (!get(repo, '_metadata.tags.updatedAt'))
    throw new Error(`Tags from "${repo.name_with_owner}" are not updated!`);

  return await MongoTag.collection
    .aggregate([
      { $match: { repository: repo._id } },
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
    .map((doc) => new Tag(doc))
    .toArray();
}
