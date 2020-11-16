/*
 *  Author: Hudson S. Borges
 */
const { chain, get } = require('lodash');

const client = require('../graphql-client.js');
const actor = require('../fragments/actor.js');
const parser = require('../parser.js');

/* eslint-disable no-param-reassign */
module.exports = async function (repositoryId, { lastCursor, max }) {
  const query = `
  query($id:ID!, $total:Int = 100, $after:String) {
    repository:node(id: $id) {
      ... on Repository {
        releases(first: $total, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            author { ...actor }
            createdAt
            description
            id
            isDraft
            isPrerelease
            name
            publishedAt
            releaseAssets { totalCount }
            tag { id }
            tagName
            updatedAt
          }
        }
      }
    }
  }
  ${actor}
  `;

  const releases = [];
  const users = [];

  let hasNextPage = true;
  const variables = { id: repositoryId, after: lastCursor };

  while (hasNextPage && releases.length < (max || Number.MAX_SAFE_INTEGER)) {
    variables.total = Math.min(100, (max || Number.MAX_SAFE_INTEGER) - releases.length);
    await client.post({ query, variables }).then(({ data }) => {
      const result = parser(get(data, 'data.repository.releases', {}));

      releases.push(...get(result, 'data.nodes', []));
      users.push(...get(result, 'users', []));

      hasNextPage = get(result, 'data.page_info.has_next_page');
      variables.after = get(result, 'data.page_info.end_cursor');
    });
  }

  return {
    releases,
    users: chain(users).compact().uniqBy('id').value(),
    endCursor: variables.after,
    hasNextPage
  };
};
