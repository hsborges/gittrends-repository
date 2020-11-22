const schema = {
  params: {
    owner: { type: 'string' },
    name: { type: 'string' }
  }
};

module.exports = async function (fastify) {
  fastify.get('/:owner/:name', { schema }, async function (request, reply) {
    const repo = await fastify.Repository.query()
      .where('name_with_owner', 'ilike', `${request.params.owner}/${request.params.name}`)
      .first('*');

    if (!repo) return reply.callNotFound();

    repo.languages = (repo.languages || []).reduce((m, l) => ({ ...m, [l.language]: l.size }), {});
    repo.owner = await fastify.Actor.query().findById(repo.owner);
    repo._metadata = (
      await fastify.Metadata.query()
        .where({ id: repo.id, key: 'updatedAt' })
        .select(['resource', 'value'])
    ).reduce((mem, m) => ({ ...mem, [m.resource]: m.value }), {});

    return reply.send(repo);
  });
};
