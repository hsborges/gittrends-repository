const moment = require('moment');

const schema = {
  params: {
    owner: { type: 'string' },
    name: { type: 'string' }
  }
};

module.exports = async function (fastify) {
  fastify.get('/:owner/:name/stargazers', { schema }, async function (request, reply) {
    const { owner, name } = request.params;

    const repo = await fastify
      .knex('repositories')
      .where('name_with_owner', 'ilike', `${owner}/${name}`)
      .first('id');

    if (!repo) return reply.callNotFound();

    const timeseries = await fastify
      .knex('stargazers')
      .select(
        fastify.knex.raw("date_trunc('week', starred_at) as week"),
        fastify.knex.raw('count(*) as stargazers_count')
      )
      .where({ repository: repo.id })
      .groupBy('week')
      .orderBy('week', 'asc');

    if (timeseries.length === 0) reply.send({ timeseries });

    const [first, last] = await Promise.all([
      fastify
        .knex('stargazers')
        .where({ repository: repo.id })
        .orderBy('starred_at', 'asc')
        .first('user', 'starred_at'),

      fastify
        .knex('stargazers')
        .where({ repository: repo.id })
        .orderBy('starred_at', 'desc')
        .first('user', 'starred_at')
    ]);

    return reply.send({
      timeseries: timeseries.reduce(
        (o, ts) => ({
          ...o,
          [moment.utc(ts.week).endOf('isoweek').format('YYYY-MM-DD')]: parseInt(
            ts.stargazers_count,
            10
          )
        }),
        {}
      ),
      first,
      last
    });
  });
};
