/*
 *  Author: Hudson S. Borges
 */
const { get, chain } = require('lodash');

const client = require('../graphql-client.js');
const parser = require('../parser.js');

const Query = require('../Query');
const RepositoryComponent = require('../components/RepositoryComponent');

/* eslint-disable no-param-reassign */
module.exports = async function (id, { lastCursor, max = Number.MAX_SAFE_INTEGER } = {}) {
  const component = RepositoryComponent.withID(id).includeDetails(false);
  const query = Query.withArgs({ total: 100 }).compose(component);

  let hasNextPage = true;
  const watchers = [];
  const users = [];

  for (; hasNextPage && watchers.length < max; ) {
    component.includeWatchers(true, {
      after: lastCursor,
      total: Math.min(100, max - watchers.length)
    });

    await client.post({ query: query.toString() }).then(({ data }) => {
      const result = parser(get(data, 'data.repository.watchers', {}));

      users.push(...get(result, 'users', []));
      watchers.push(...get(result, 'data.nodes', []).map((w) => ({ user: w })));

      hasNextPage = get(result, 'data.page_info.has_next_page', false);
      lastCursor = get(result, 'data.page_info.end_cursor', lastCursor);
    });
  }

  return {
    watchers,
    users: chain(users).compact().uniqBy('id').value(),
    endCursor: lastCursor,
    hasNextPage
  };
};
