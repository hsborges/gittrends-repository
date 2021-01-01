import { FastifyInstance } from 'fastify';
import { Actor, Metadata, Repository } from '@gittrends/database-config';
import { IActor, IMetadata, IRepository } from '@gittrends/database-config';

interface IParams {
  owner: string;
  name: string;
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Params: IParams }>('/:owner/:name', async function (request, reply) {
    const repo: IRepository = await Repository.query()
      .where('name_with_owner', 'ilike', `${request.params.owner}/${request.params.name}`)
      .first('*');

    if (!repo) return reply.callNotFound();

    const owner: IActor = await Actor.query().where({ id: repo.owner }).first();
    const metadata: IMetadata[] = await Metadata.query()
      .where({ id: repo.id, key: 'updatedAt' })
      .select(['resource', 'value']);

    return reply.send({
      ...repo,
      owner,
      languages: repo.languages.reduce(
        (m: Record<string, number>, lang) => ({ ...m, [lang.language]: lang.size }),
        {}
      ),
      _metadata: metadata.reduce((mem, m) => ({ ...mem, [m.resource]: m.value }), {})
    });
  });
}
