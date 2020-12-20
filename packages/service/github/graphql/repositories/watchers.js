/*
 *  Author: Hudson S. Borges
 */
const { get, chain } = require('lodash');

const Query = require('../Query');
const RepositoryComponent = require('../components/RepositoryComponent');

/* eslint-disable no-param-reassign */
module.exports = async function (id, { lastCursor, max = Number.MAX_SAFE_INTEGER } = {}) {
  const component = RepositoryComponent.with({ id }).includeDetails(false);

  let hasNextPage = true;
  const watchers = [];
  const users = [];

  for (; hasNextPage && watchers.length < max; ) {
    await Query.create()
      .compose(
        component.includeWatchers(true, {
          after: lastCursor,
          first: Math.min(100, max - watchers.length)
        })
      )
      .then(({ data, users: _users = [] }) => {
        users.push(..._users);
        watchers.push(...get(data, 'repository.watchers.nodes', []).map((w) => ({ user: w })));

        hasNextPage = get(data, 'repository.watchers.page_info.has_next_page', false);
        lastCursor = get(data, 'repository.watchers.page_info.end_cursor', lastCursor);
      });
  }

  return {
    watchers,
    users: chain(users).compact().uniqBy('id').value(),
    endCursor: lastCursor,
    hasNextPage
  };
};
