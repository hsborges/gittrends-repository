import { FastifyInstance } from 'fastify';
import * as Models from '@gittrends/database-config';
import Model from '@gittrends/database-config/dist/models';

export default async function (fastify: FastifyInstance): Promise<void> {
  const query = (Model: Model) =>
    Model.query()
      .count({ count: '*' })
      .first()
      .then(({ count }) => count);

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
