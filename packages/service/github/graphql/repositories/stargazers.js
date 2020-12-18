/*
 *  Author: Hudson S. Borges
 */
const { chain, get } = require('lodash');

const client = require('../graphql-client.js');
const parser = require('../parser.js');

const Query = require('../Query');
const RepositoryComponent = require('../components/RepositoryComponent');

/* eslint-disable no-param-reassign */
module.exports = async function (repositoryId, { lastCursor, max = Number.MAX_SAFE_INTEGER } = {}) {
  const component = RepositoryComponent.withID(repositoryId).includeDetails(false);
  const query = Query.withArgs({ total: 100 }).compose(component);

  let hasNextPage = true;
  const stargazers = [];
  const users = [];

  for (; hasNextPage && stargazers.length < max; ) {
    component.includeStargazers(true, {
      after: lastCursor,
      total: Math.min(100, max - stargazers.length)
    });

    await client
      .post({ query: query.toString() })
      .catch((error) => {
        const errors = get(error, 'response.errors', []);
        if (errors.reduce((internal, e) => internal && e.type === 'INTERNAL', true))
          return error.response;
        throw error;
      })
      .then(({ data }) => {
        const result = parser(get(data, 'data.repository.stargazers', {}));

        stargazers.push(...get(result, 'data.edges', []));
        users.push(...get(result, 'users', []));

        hasNextPage = get(result, 'data.page_info.has_next_page', false);
        lastCursor = get(result, 'data.page_info.end_cursor', lastCursor);
      });
  }

  return {
    stargazers,
    users: chain(users).compact().uniqBy('id').value(),
    endCursor: lastCursor,
    hasNextPage
  };
};
