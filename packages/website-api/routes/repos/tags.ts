import { FastifyInstance } from 'fastify';
import knex, { Repository, IRepository, Metadata, Tag } from '@gittrends/database-config';

interface IParams {
  owner: string;
  name: string;
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Params: IParams }>('/:owner/:name/tags', async function (request, reply) {
    const repo: IRepository = await Repository.query()
      .where(
        knex.raw('lower(name_with_owner)'),
        'like',
        `${request.params.owner}/${request.params.name}`
      )
      .first('id');

    if (!repo) return reply.callNotFound();

    const updated = await Metadata.query()
      .where({ id: repo.id, resource: 'tags', key: 'updatedAt' })
      .count({ count: 'id' })
      .first();

    if (!updated || !updated.count) return reply.callNotFound();

    const tags = await Tag.query()
      .join('commits', 'tags.target', 'commits.id')
      .select(
        'tags.id',
        'tags.name',
        'commits.committed_date',
        'commits.additions',
        'commits.changed_files',
        'commits.deletions'
      )
      .where('tags.repository', repo.id);

    reply.send(tags);
  });
}
