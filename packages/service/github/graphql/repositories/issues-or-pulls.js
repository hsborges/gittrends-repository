/*
 *  Author: Hudson S. Borges
 */
const { chain, get } = require('lodash');

const compact = require('../../../helpers/compact.js');
const { BadGatewayError } = require('../../../helpers/errors.js');

const Query = require('../Query');
const RepositoryComponent = require('../components/RepositoryComponent');

/* eslint-disable no-param-reassign */
module.exports = async function (id, type, { lastCursor, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (!type || (type !== 'issues' && type !== 'pulls'))
    throw new TypeError('Type must be "issues" or "pulls"!');

  const name = type === 'pulls' ? 'pullRequests' : 'issues';
  const component = RepositoryComponent.with({ id }).includeDetails(false);

  let hasNextPage = true;
  let reduce = 0;

  const objects = [];
  const users = [];

  for (; hasNextPage && objects.length < max; ) {
    const total = Math.min(100, max - objects.length) - reduce;
    const args = { first: total, after: lastCursor };

    if (type === 'issues') component.includeIssues(true, args);
    else component.includePullRequests(true, args);

    await Query.create()
      .compose(component)
      .then(({ data, users: _users = [] }) => {
        users.push(..._users);
        objects.push(...get(data, `repository.${name}.nodes`, []));

        reduce = 0;
        hasNextPage = get(data, `repository.${name}.page_info.has_next_page`, false);
        lastCursor = get(data, `repository.${name}.page_info.end_cursor`, lastCursor);
      })
      .catch((err) => {
        if (err instanceof BadGatewayError && total > 1) return (reduce += Math.ceil(total / 2));
        throw err;
      });
  }

  return {
    [type]: compact(objects) || [],
    users: chain(users).compact().uniqBy('id').value() || [],
    endCursor: lastCursor,
    hasNextPage
  };
};
