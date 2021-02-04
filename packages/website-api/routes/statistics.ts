import { FastifyInstance } from 'fastify';
import knex, * as Models from '@gittrends/database-config';

export default async function (fastify: FastifyInstance): Promise<void> {
  async function query<T extends Models.Model>(model: T) {
    return model
      .query()
      .select(knex.raw('count(*)::integer as count'))
      .first()
      .then(({ count }) => count);
  }

  fastify.get('/statistics', async function (request, reply) {
    const [repositories, users, stargazers, tags] = await Promise.all([
      query(Models.Repository),
      query(Models.Actor),
      query(Models.Stargazer),
      query(Models.Tag)
    ]);

    return reply.send({ repositories, users, stargazers, tags });
  });
}
