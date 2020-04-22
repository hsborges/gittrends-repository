/*
 *  Author: Hudson S. Borges
 */
const { get, chain } = require('lodash');

const client = require('../graphql-client.js');
const actorFragment = require('../fragments/actor.js');
const parser = require('../parser.js');

/* eslint-disable no-param-reassign */
module.exports = async function (id, { lastCursor, max }) {
  const query = `
  query($id:ID!, $total:Int = 100, $after:String) {
    repository:node(id: $id) {
      ... on Repository {
        watchers(first: $total, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes { ...actor }
        }
      }
    }
  }
  ${actorFragment}
  `;

  const watchers = [];
  const users = [];

  const variables = { id, after: lastCursor };
  let hasNextPage = true;

  while (hasNextPage && watchers.length < (max || Number.MAX_SAFE_INTEGER)) {
    variables.total = Math.min(100, (max || Number.MAX_SAFE_INTEGER) - watchers.length);
    await client.post({ query, variables }).then(({ data }) => {
      const result = parser(get(data, 'data.repository.watchers', {}));

      users.push(...get(result, 'users', []));
      watchers.push(...get(result, 'data.nodes', []).map((w) => ({ user: w })));

      hasNextPage = get(result, 'data.page_info.has_next_page', false);
      variables.after = get(result, 'data.page_info.end_cursor');
    });
  }

  return {
    watchers,
    users: chain(users).compact().uniqBy('id').value(),
    endCursor: variables.after,
    hasNextPage
  };
};
