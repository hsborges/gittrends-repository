import { FastifyInstance } from 'fastify';
import { IRepository, Repository } from '@gittrends/database-config';

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
    const [pipelineResult] = await Repository.collection
      .aggregate([
        { $match: { name_with_owner: new RegExp(request.query.query, 'i') } },
        {
          $match: request.query.language
            ? { primary_language: new RegExp(`^${request.query.language}$`, 'i') }
            : {}
        },
        {
          $facet: {
            repositories: [{ $skip: request.query.offset }, { $limit: request.query.limit }],
            languages: [
              { $group: { _id: '$primary_language', count: { $sum: 1 } } },
              { $project: { _id: 0, language: '$_id', count: '$count' } },
              { $sort: { count: -1 } }
            ],
            count: [{ $count: 'totalRepositories' }]
          }
        }
      ])
      .toArray();

    const repositories: Array<IRepository> = pipelineResult.repositories;
    const languages: Array<{ language: string; count: number }> = pipelineResult.languages;
    const count: number = pipelineResult.count[0].totalRepositories;

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
