import { FastifyInstance } from 'fastify';
import { IActor, Actor, IRepository, Repository } from '@gittrends/database-config';

interface IParams {
  owner: string;
  name: string;
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Params: IParams }>('/:owner/:name', async function (request, reply) {
    const repo: IRepository = await Repository.collection.findOne({
      name_with_owner: new RegExp(`${request.params.owner}/${request.params.name}`, 'i')
    });

    if (!repo) return reply.callNotFound();

    const owner: IActor = await Actor.collection.findOne({ _id: repo.owner });

    return reply.send({
      ...repo,
      owner,
      languages: repo.languages?.reduce(
        (m: Record<string, number>, lang) => ({ ...m, [lang.language]: lang.size }),
        {}
      ),
      _metadata: Object.entries(repo._metadata || {}).reduce(
        (mem, [key, value]) => (value.updatedAt ? { ...mem, [key]: value.updatedAt } : mem),
        {}
      )
    });
  });
}
