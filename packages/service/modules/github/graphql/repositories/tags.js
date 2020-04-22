/*
 *  Author: Hudson S. Borges
 */
const { chain, set, get, omit } = require('lodash');

const client = require('../graphql-client.js');

const parser = require('../parser.js');
const actorFragment = require('../fragments/actor.js');
const commitFragment = require('../fragments/commit.js');
const tagFragment = require('../fragments/tag.js');
const { BadGatewayError, ServiceUnavailableError } = require('../../../errors.js');

/* eslint-disable no-param-reassign */
module.exports = function (id, { lastCursor, max }) {
  const query = `
  query($id:ID!, $total:Int = 100, $after:String) {
    repository:node(id: $id) {
      ... on Repository {
        refs(refPrefix:"refs/tags/", first: $total, direction: ASC, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              name
              target {
                type:__typename
                id
                oid
                ...commit
                ...tag
              }
            }
          }
        }
      }
    }
  }
  ${actorFragment}
  ${commitFragment}
  ${tagFragment}
  `;

  const tags = [];
  const users = [];
  const commits = [];

  return (function _request(
    after,
    total = Math.min(100, (max || Number.MAX_SAFE_INTEGER) - tags.length)
  ) {
    return client
      .post({ query, variables: { id, total, after } })
      .catch(async (error) => {
        if (error instanceof BadGatewayError && total > 1)
          return _request(after, Math.ceil(total / 2));

        if (error instanceof ServiceUnavailableError) {
          const isAllSame = error.response.errors.reduce(
            (is, e) => is && e.type === 'SERVICE_UNAVAILABLE',
            true
          );

          if (isAllSame) {
            await Promise.each(error.response.errors, async (data) => {
              const cursor = get(
                error.response,
                `data.repository.refs.edges[${data.path[3] - 1}].cursor`,
                lastCursor
              );

              return client
                .post({
                  query: query
                    .replace(/additions/i, '')
                    .replace(/deletions/i, '')
                    .replace(/changedFiles/i, ''),
                  variables: { id, total: 1, cursor }
                })
                .then((result) =>
                  set(
                    error.response,
                    `data.repository.refs.edges[${data.path[3]}]`,
                    result.data.data.repository.refs.edges[0]
                  )
                );
            });

            return Promise.resolve({ data: omit(error.response, 'errors') });
          }
        }
        throw error;
      })
      .then(({ data }) => {
        const result = parser(get(data, 'data.repository.refs', {}));
        const hasNextPage = get(result, 'data.page_info.has_next_page');
        const endCursor = get(result, 'data.page_info.end_cursor');

        tags.push(
          ...get(result, 'data.edges', []).map((edge) =>
            edge.node.target && edge.node.target.type === 'Tag'
              ? omit(edge.node.target, 'type')
              : edge.node
          )
        );

        users.push(...get(result, 'users', []));
        commits.push(...get(result, 'commits', []));

        if (hasNextPage && tags.length < (max || Number.MAX_SAFE_INTEGER))
          return _request(endCursor);

        return {
          tags,
          commits: chain(commits).compact().uniqBy('id').value(),
          users: chain(users).compact().uniqBy('id').value(),
          endCursor,
          hasNextPage
        };
      });
  })(lastCursor);
};
