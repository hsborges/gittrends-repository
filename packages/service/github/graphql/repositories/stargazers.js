/*
 *  Author: Hudson S. Borges
 */
const { chain, get } = require('lodash');

const Query = require('../Query');
const RepositoryComponent = require('../components/RepositoryComponent');

/* eslint-disable no-param-reassign */
module.exports = async function (repositoryId, { lastCursor, max = Number.MAX_SAFE_INTEGER } = {}) {
  const component = RepositoryComponent.with({ id: repositoryId }).includeDetails(false);

  let hasNextPage = true;
  const stargazers = [];
  const users = [];

  for (; hasNextPage && stargazers.length < max; ) {
    await Query.create()
      .compose(
        component.includeStargazers(true, {
          after: lastCursor,
          first: Math.min(100, max - stargazers.length)
        })
      )
      .catch((error) => {
        const errors = get(error, 'response.errors', []);
        if (errors.reduce((internal, e) => internal || e.type === 'INTERNAL', false))
          return error.response;
        throw error;
      })
      .then(({ data, users: _users = [] }) => {
        stargazers.push(...get(data, 'repository.stargazers.edges', []));
        users.push(..._users);

        hasNextPage = get(data, 'repository.stargazers.page_info.has_next_page', false);
        lastCursor = get(data, 'repository.stargazers.page_info.end_cursor', lastCursor);
      });
  }

  return {
    stargazers,
    users: chain(users).compact().uniqBy('id').value(),
    endCursor: lastCursor,
    hasNextPage
  };
};
