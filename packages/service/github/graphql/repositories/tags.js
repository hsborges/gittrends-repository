/*
 *  Author: Hudson S. Borges
 */
const { chain, set, get, omit } = require('lodash');

const client = require('../graphql-client.js');
const parser = require('../parser.js');

const { BadGatewayError, ServiceUnavailableError } = require('../../../helpers/errors.js');

const Query = require('../Query');
const RepositoryComponent = require('../components/RepositoryComponent');

/* eslint-disable no-param-reassign */
module.exports = async function (id, { lastCursor, max = Number.MAX_SAFE_INTEGER } = {}) {
  const component = RepositoryComponent.withID(id).includeDetails(false);
  const query = Query.withArgs({ total: 100 }).compose(component);

  let hasNextPage = true;
  let reducer = 1;

  const tags = [];
  const users = [];
  const commits = [];

  for (; hasNextPage && tags.length < max; ) {
    const total = Math.min(100, max - tags.length) / reducer;
    component.includeTags(true, { after: lastCursor, total });

    await client
      .post({ query: query.toString() })
      .then(({ data }) => {
        const result = parser(get(data, 'data.repository.refs', {}));

        tags.push(
          ...get(result, 'data.edges', []).map((edge) =>
            edge.node.target && edge.node.target.type === 'Tag'
              ? omit(edge.node.target, 'type')
              : edge.node
          )
        );

        users.push(...get(result, 'users', []));
        commits.push(...get(result, 'commits', []));

        reducer = 1;
        lastCursor = get(result, 'data.page_info.end_cursor', lastCursor);
        hasNextPage = get(result, 'data.page_info.has_next_page');
      })
      .catch(async (error) => {
        if (error instanceof BadGatewayError && total > 1) return (reducer *= 2);

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

              component.includeTags(true, { after: cursor, total: 1 });
              return client
                .post({
                  query: query
                    .toString()
                    .replace(/additions/i, '')
                    .replace(/deletions/i, '')
                    .replace(/changedFiles/i, '')
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
      });
  }

  return {
    tags,
    commits: chain(commits).compact().uniqBy('id').value(),
    users: chain(users).compact().uniqBy('id').value(),
    endCursor: lastCursor,
    hasNextPage
  };
};
