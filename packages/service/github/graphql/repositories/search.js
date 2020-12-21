/*
 *  Author: Hudson S. Borges
 */
const { get, chain, differenceBy, min, isNumber } = require('lodash');

const { BadGatewayError } = require('../../../helpers/errors.js');

const Query = require('../Query');
const SearchComponent = require('../components/SearchComponent');

module.exports = async (limit, { language }) => {
  if (!limit || !isNumber(limit))
    throw new TypeError('The maximum number of repositories is required!');

  const repos = [];
  const users = [];

  let after = null;
  let total = 100;
  let maxStargazers = null;

  for (; repos.length < limit; ) {
    await Query.create()
      .compose(SearchComponent.with({ after, first: total, maxStargazers }))
      .then(({ data, users: _users = [] }) => {
        users.push(...(_users || []));

        repos.push(
          ...differenceBy(get(data, 'search.nodes', []), repos, 'id').slice(0, limit - repos.length)
        );

        if (get(data, 'search.page_info.has_next_page')) {
          after = get(data, 'search.page_info.end_cursor');
        } else {
          after = null;
          maxStargazers = min(repos.map((r) => r.stargazers_count));
        }

        total = 100;
      })
      .catch((err) => {
        if (err instanceof BadGatewayError) return (total = Math.ceil(total / 2));
        throw err;
      });
  }

  return {
    repositories: chain(repos).compact().sortBy('stargazers_count', 'desc').value(),
    users: chain(users).uniqBy('id').compact().value()
  };
};
