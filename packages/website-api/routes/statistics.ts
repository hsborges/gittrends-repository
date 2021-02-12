import { FastifyInstance } from 'fastify';
import { Repository, Actor, Stargazer, Tag, Model } from '@gittrends/database-config';

export default async function (fastify: FastifyInstance): Promise<void> {
  async function query<T extends Model>(model: T) {
    return model.collection.estimatedDocumentCount();
  }

  fastify.get('/statistics', async function (request, reply) {
    const [repositories, users, stargazers, tags] = await Promise.all(
      [Repository, Actor, Stargazer, Tag].map(query)
    );

    return reply.send({ repositories, users, stargazers, tags });
  });
}
