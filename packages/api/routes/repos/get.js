const schema = {
  params: {
    owner: { type: 'string' },
    name: { type: 'string' }
  }
};

module.exports = async function (fastify) {
  fastify.get('/:owner/:name', { schema }, async function (request, reply) {
    const repo = await fastify
      .knex('repositories')
      .where('name_with_owner', 'ilike', `${request.params.owner}/${request.params.name}`)
      .first('*');

    if (!repo) return reply.callNotFound();

    const [owner, topics, meta] = await Promise.all([
      fastify.knex('users').where({ id: repo.owner }).first('*'),
      fastify.knex('repository_topics').select('topic').where({ repository: repo.id }),
      fastify
        .knex('repository_metadata')
        .select(['resource', 'updated_at'])
        .where({ repository: repo.id })
    ]);

    return repo
      ? reply.send({
          ...repo,
          owner,
          topics: topics.map((t) => t.topic),
          _metadata: meta.reduce((m, r) => ({ ...m, [r.resource]: r.updated_at }), {})
        })
      : reply.callNotFound();
  });
};
