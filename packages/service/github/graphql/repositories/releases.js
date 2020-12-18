/*
 *  Author: Hudson S. Borges
 */
const { chain, get } = require('lodash');

const Query = require('../Query');
const RepositoryComponent = require('../components/RepositoryComponent');

/* eslint-disable no-param-reassign */
module.exports = async function (repositoryId, { lastCursor, max = Number.MAX_SAFE_INTEGER } = {}) {
  const component = RepositoryComponent.withID(repositoryId).includeDetails(false);
  const query = Query.withArgs().compose(component);

  let hasNextPage = true;
  const releases = [];
  const users = [];

  for (; hasNextPage && releases.length < max; ) {
    component.includeReleases(true, {
      after: lastCursor,
      total: Math.min(100, max - releases.length)
    });

    await query.run().then(({ repository, users: _users = [] } = {}) => {
      releases.push(...get(repository, 'releases.nodes', []));
      users.push(..._users);

      hasNextPage = get(repository, 'releases.page_info.has_next_page');
      lastCursor = get(repository, 'releases.page_info.end_cursor', lastCursor);
    });
  }

  return {
    releases,
    users: chain(users).compact().uniqBy('id').value(),
    endCursor: lastCursor,
    hasNextPage
  };
};
