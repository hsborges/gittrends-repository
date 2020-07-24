/*
 *  Author: Hudson S. Borges
 */
const { get, chain, differenceBy, min, isNumber } = require('lodash');

const debug = require('debug')('gittrends:graphql:search');

const client = require('../graphql-client.js');
const actorFragment = require('../fragments/actor.js');
const repoFragment = require('../fragments/repository.js');
const parser = require('../parser.js');
const { BadGatewayError } = require('../../../helpers/errors.js');

module.exports = async (limit, { language }) => {
  if (!limit || !isNumber(limit))
    throw new TypeError('The maximum number of repositories is required!');

  const query = `
  query($total:Int!, $query:String = "stars:1..* sort:stars-desc", $after:String) {
    search(first:$total, type: REPOSITORY, query: $query, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { ...repository }
    }
  }
  ${actorFragment}
  ${repoFragment}
  `;

  const repos = [];
  const users = [];

  let after = null;
  let total = 100;
  let maxStargazers = null;

  for (; repos.length < limit; ) {
    const variables = {
      total: Math.min(total, (limit || Number.MAX_SAFE_INTEGER) - repos.length),
      query: `stars:1..${maxStargazers || '*'} sort:stars-desc ${
        language ? ` language:${language}` : ''
      }`,
      after
    };

    await client
      .post({ query, variables })
      .then(({ data }) => {
        const result = parser(get(data, 'data.search', {}));

        total = 100;
        users.push(...get(result, 'users', []));
        repos.push(...differenceBy(get(result, 'data.nodes', []), repos, 'id'));

        if (get(result, 'data.page_info.has_next_page')) {
          after = get(result, 'data.page_info.end_cursor');
        } else {
          after = null;
          maxStargazers = min(repos.map((r) => r.stargazers_count));
        }
      })
      .catch((err) => {
        if (err instanceof BadGatewayError) return (total = Math.ceil(total / 2));
        throw err;
      })
      .finally(() => debug('%o', { repos: repos.length, users: users.length, maxStargazers }));
  }

  return {
    repositories: chain(repos).compact().sortBy('stargazers_count', 'desc').value(),
    users: chain(users).uniqBy('id').compact().value()
  };
};
