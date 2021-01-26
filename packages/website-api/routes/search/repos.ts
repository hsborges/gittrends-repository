import { FastifyInstance } from 'fastify';
import knex, { IRepository, Repository } from '@gittrends/database-config';

const schema = {
  querystring: {
    properties: {
      query: { type: 'string', default: '' },
      language: { type: 'string' },
      sortBy: {
        type: 'string',
        enum: ['stargazers_count', 'name', 'name_with_owner', 'random'],
        default: 'stargazers_count'
      },
      order: {
        type: 'string',
        enum: ['desc', 'asc'],
        default: 'desc'
      },
      limit: {
        type: 'number',
        default: 25,
        minValue: 1,
        maxValue: 25
      },
      offset: {
        type: 'number',
        default: 0,
        minValue: 0
      }
    }
  }
};

interface IQuerystring {
  query: string;
  language: string;
  sortBy: 'stargazers_count' | 'name' | 'name_with_owner' | 'random';
  order: 'asc' | 'desc';
  limit: number;
  offset: number;
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Querystring: IQuerystring }>('/repos', { schema }, async function (request, reply) {
    const repositories: Array<IRepository> = await Repository.query()
      .where((builder) => {
        builder.where(knex.raw('lower(name_with_owner)'), 'like', `%${request.query.query}%`);
        if (request.query.language)
          builder.where(knex.raw('lower(primary_language)'), 'like', request.query.language);
      })
      .orderByRaw(
        request.query.sortBy === 'random'
          ? 'random()'
          : `${request.query.sortBy} ${request.query.order}`
      )
      // TODO - limit the fields returned with .select(...)
      .limit(request.query.limit)
      .offset(request.query.offset);

    const [{ count }] = await Repository.query()
      .where((builder) => {
        builder.where(knex.raw('lower(name_with_owner)'), 'like', `%${request.query.query}%`);
        if (request.query.language)
          builder.where(knex.raw('lower(primary_language)'), 'like', request.query.language);
      })
      .count('id', { as: 'count' });

    const languages: Array<{ language: string; count: number }> = await Repository.query()
      .select('primary_language as language')
      .count('*', { as: 'count' })
      .where((builder) => {
        if (request.query.query)
          builder.where(knex.raw('lower(name_with_owner)'), 'like', `%${request.query.query}%`);
        if (request.query.language)
          builder.where(knex.raw('lower(primary_language)'), 'like', request.query.language);
      })
      .groupBy('primary_language')
      .orderBy('count', 'desc');

    reply.send({
      repositories,
      meta: {
        repositories_count: count,
        languages_count: languages.reduce(
          (acc, lang) => ({ ...acc, [lang.language]: lang.count }),
          {}
        )
      }
    });
  });
}
