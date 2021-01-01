import { FastifyInstance } from 'fastify';

import { Actor, IActor } from '@gittrends/database-config';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Params: { id: string } }>('/:id', async function (request, reply) {
    const user: IActor = await Actor.query()
      .where({ id: request.params.id })
      .orWhere({ login: request.params.id })
      .first('*');
    if (!user) return reply.callNotFound();
    return reply.send(user);
  });
}
