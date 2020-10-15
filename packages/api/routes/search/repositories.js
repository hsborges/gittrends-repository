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

module.exports = async function (fastify) {
  fastify.get('/repos', { schema }, async function (request, reply) {
    const repositories = await fastify
      .knex('repositories')
      .where((builder) => {
        builder.where('name_with_owner', 'like', `%${request.query.query}%`);
        if (request.query.language)
          builder.where('primary_language', 'like', request.query.language);
      })
      .orderByRaw(
        request.query.sortBy === 'random'
          ? 'random()'
          : `${request.query.sortBy} ${request.query.order}`
      )
      .limit(request.query.limit)
      .offset(request.query.offset);

    const [{ count }] = await fastify
      .knex('repositories')
      .where((builder) => {
        builder.where('name_with_owner', 'like', `%${request.query.query}%`);
        if (request.query.language)
          builder.where('primary_language', 'like', request.query.language);
      })
      .count('id', { as: 'count' });

    const languages = await fastify
      .knex('repositories')
      .select('primary_language as language')
      .count('*', { as: 'count' })
      .where((builder) => {
        builder.where('name_with_owner', 'like', `%${request.query.query}%`);
        if (request.query.language)
          builder.where('primary_language', 'like', request.query.language);
      })
      .groupBy('primary_language')
      .orderBy('count', 'desc');

    reply.send({
      repositories,
      meta: {
        repositories_count: count,
        languages_count: languages.reduce((m, l) => ({ ...m, [l.language]: l.count }), {})
      }
    });
  });
};
