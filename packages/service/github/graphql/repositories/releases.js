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
  const releases = [];
  const users = [];

  for (; hasNextPage && releases.length < max; ) {
    await Query.create()
      .compose(
        component.includeReleases(true, {
          after: lastCursor,
          first: Math.min(100, max - releases.length)
        })
      )
      .then(({ data, users: _users = [] } = {}) => {
        releases.push(...get(data, 'repository.releases.nodes', []));
        users.push(..._users);

        hasNextPage = get(data, 'repository.releases.page_info.has_next_page');
        lastCursor = get(data, 'repository.releases.page_info.end_cursor', lastCursor);
      });
  }

  return {
    releases,
    users: chain(users).compact().uniqBy('id').value(),
    endCursor: lastCursor,
    hasNextPage
  };
};
