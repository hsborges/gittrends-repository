import { FastifyInstance } from 'fastify';
import { Repository, IRepository, Tag } from '@gittrends/database-config';
import { get } from 'lodash';

interface IParams {
  owner: string;
  name: string;
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Params: IParams }>('/:owner/:name/tags', async function (request, reply) {
    const repo: IRepository | null = await Repository.collection.findOne(
      { name_with_owner: new RegExp(`^${request.params.owner}/${request.params.name}$`, 'i') },
      { projection: { _id: 1, _metadata: 1 } }
    );

    if (!repo || !get(repo, '_metadata.tags.updatedAt')) return reply.callNotFound();

    const tags = await Tag.collection
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
            changed_files: '$commit.changed_files',
            deletions: '$commit.deletions'
          }
        }
      ])
      .toArray();

    reply.send(tags);
  });
}
