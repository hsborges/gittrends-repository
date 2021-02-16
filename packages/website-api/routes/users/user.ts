/*
 *  Author: Hudson S. Borges
 */
import { FastifyInstance } from 'fastify';

import { Actor, IActor } from '@gittrends/database-config';

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Params: { id: string } }>('/:id', async function (request, reply) {
    const user: IActor = await Actor.collection.findOne({
      $or: [{ _id: request.params.id }, { login: request.params.id }]
    });
    if (!user) return reply.callNotFound();
    return reply.send(user);
  });
}
