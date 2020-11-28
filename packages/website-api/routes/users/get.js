const schema = {
  params: {
    id: { type: 'string' }
  }
};

module.exports = async function (fastify) {
  fastify.get('/:id', { schema }, async function (request, reply) {
    const user = await fastify.Actor.query()
      .where({ id: request.params.id })
      .orWhere({ login: request.params.id })
      .first('*');
    if (!user) return reply.callNotFound();
    return reply.send(user);
  });
};
