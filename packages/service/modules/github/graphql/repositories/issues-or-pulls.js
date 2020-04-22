/*
 *  Author: Hudson S. Borges
 */
const { chain, get, omit } = require('lodash');

const client = require('../graphql-client.js');
const actorFragment = require('../fragments/actor.js');
const parser = require('../parser.js');
const compact = require('../../../compact.js');

/* eslint-disable no-param-reassign */
module.exports = async function (id, type, { lastCursor, max } = {}) {
  if (!type || (type !== 'issues' && type !== 'pulls'))
    throw new TypeError('Type must be "issues" or "pulls"!');

  const name = type === 'pulls' ? 'pullRequests' : 'issues';

  const query = `
  query($id:ID!, $total:Int = 100, $after:String) {
    repository:node(id: $id) {
      ... on Repository {
        ${type}:${name}(first: $total, orderBy: { field: UPDATED_AT, direction: ASC }, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            type:__typename
            author { ...actor }
            authorAssociation
            bodyText
            closedAt
            createdAt
            createdViaEmail
            databaseId
            editor { ...actor }
            lastEditedAt
            locked
            number
            publishedAt
            state
            title
            updatedAt
            # url
            ${type === 'issues' ? '' : 'baseRefName isCrossRepository merged mergedAt'}
          }
        }
      }
    }
  }
  ${actorFragment}
  `;

  const objects = [];
  const users = [];
  const variables = { id, after: lastCursor, hasNextPage: true };

  for (; variables.hasNextPage && objects.length < (max || Number.MAX_SAFE_INTEGER); ) {
    variables.total = Math.min(100, (max || Number.MAX_SAFE_INTEGER) - objects.length);

    await client.post({ query, variables: omit(variables, 'hasNextPage') }).then(({ data }) => {
      const result = parser(get(data, `data.repository.${type}`, {}));

      users.push(...get(result, 'users', []));
      objects.push(...get(result, 'data.nodes', []));

      variables.hasNextPage = get(result, 'data.page_info.has_next_page', false);
      variables.after = get(result, 'data.page_info.end_cursor', null);
    });
  }

  return {
    [type]: compact(objects),
    users: chain(users).compact().uniqBy('id').value(),
    endCursor: variables.after,
    hasNextPage: variables.hasNextPage
  };
};
