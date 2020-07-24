/*
 *  Author: Hudson S. Borges
 */
const { isArray, chunk } = require('lodash');

const client = require('../graphql-client.js');
const actorFragment = require('../fragments/actor.full.js');
const { BadGatewayError } = require('../../../helpers/errors.js');

module.exports = async function (id) {
  const variables = {};
  let query = '';

  if (isArray(id)) {
    variables.ids = id;
    query += ` query($ids: [ID!]!) {
      users:nodes(ids: $ids) { ...actor }
    } `;
  } else {
    variables.id = id;
    query += ` query($id: ID!) {
      user:node(id: $id) { ...actor }
    } `;
  }

  query += `${actorFragment}`;

  return client
    .post({ query, variables })
    .then(({ data: { data } }) => {
      if (isArray(id)) return { users: data.users };
      return { user: data.user };
    })
    .catch(async (err) => {
      if (isArray(id) && id.length > 1 && err instanceof BadGatewayError) {
        const idsChunk = chunk(id, Math.ceil(id.length / 2));
        return Promise.mapSeries(idsChunk, module.exports).then((results) =>
          results.reduce((acc, res) => ({ users: (acc.users || []).concat(res.users) }), {})
        );
      }
      throw err;
    });
};
