/*
 *  Author: Hudson S. Borges
 */
const { chain, get } = require('lodash');

const client = require('../graphql-client.js');
const actorFragment = require('../fragments/actor.js');
const parser = require('../parser.js');

/* eslint-disable no-param-reassign */
module.exports = async function (repositoryId, { lastCursor, max }) {
  const query = `
  query($id:ID!, $total:Int = 100, $after:String) {
    repository:node(id: $id) {
      ... on Repository {
        stargazers_list:stargazers(first: $total, after: $after, orderBy: { direction: ASC, field: STARRED_AT }) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            starredAt
            user:node { ...actor }
          }
        }
      }
    }
  }
  ${actorFragment}
  `;

  const stargazers = [];
  const users = [];

  let hasNextPage = true;

  const variables = {
    id: repositoryId,
    after: lastCursor,
    total: Math.min(100, (max || Number.MAX_SAFE_INTEGER) - stargazers.length)
  };

  while (hasNextPage && stargazers.length < (max || Number.MAX_SAFE_INTEGER)) {
    await client
      .post({ query, variables })
      .catch((error) => {
        const errors = get(error, 'response.errors', []);
        if (errors.reduce((internal, e) => internal && e.type === 'INTERNAL', true))
          return error.response;
        throw error;
      })
      .then(({ data }) => {
        const result = parser(get(data, 'data.repository.stargazers_list', {}));

        stargazers.push(...get(result, 'data.edges', []));
        users.push(...get(result, 'users', []));

        hasNextPage = get(result, 'data.page_info.has_next_page', false);
        variables.total = Math.min(100, (max || Number.MAX_SAFE_INTEGER) - stargazers.length);
        variables.after = get(result, 'data.page_info.end_cursor', variables.after);
      });
  }

  return {
    stargazers,
    users: chain(users).compact().uniqBy('id').value(),
    endCursor: variables.after,
    hasNextPage
  };
};
