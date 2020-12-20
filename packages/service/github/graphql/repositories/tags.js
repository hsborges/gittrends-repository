/*
 *  Author: Hudson S. Borges
 */
const { chain, get, omit } = require('lodash');

const { BadGatewayError } = require('../../../helpers/errors.js');

const Query = require('../Query');
const RepositoryComponent = require('../components/RepositoryComponent');

/* eslint-disable no-param-reassign */
module.exports = async function (id, { lastCursor, max = Number.MAX_SAFE_INTEGER } = {}) {
  const component = RepositoryComponent.with({ id }).includeDetails(false);

  let hasNextPage = true;
  let reducer = 0;

  const tags = [];
  const users = [];
  const commits = [];

  for (; hasNextPage && tags.length < max; ) {
    const total = Math.min(100, max - tags.length) - reducer;

    await Query.create()
      .compose(component.includeTags(true, { after: lastCursor, first: total }))
      .then(({ data, users: _users = [], commits: _commits = [] }) => {
        tags.push(
          ...get(data, 'repository.tags.edges', []).map((edge) =>
            edge.node.target && edge.node.target.type === 'Tag'
              ? omit(edge.node.target, 'type')
              : edge.node
          )
        );

        users.push(..._users);
        commits.push(..._commits);

        reducer = 0;
        lastCursor = get(data, 'repository.tags.page_info.end_cursor', lastCursor);
        hasNextPage = get(data, 'repository.tags.page_info.has_next_page');
      })
      .catch(async (error) => {
        if (error instanceof BadGatewayError && total > 1) return (reducer = total / 2);

        // if (error instanceof ServiceUnavailableError) {
        //   const isAllSame = error.response.errors.reduce(
        //     (is, e) => is && e.type === 'SERVICE_UNAVAILABLE',
        //     true
        //   );

        //   if (isAllSame) {
        //     await Promise.each(error.response.errors, async (data) => {
        //       const cursor = get(
        //         error.response,
        //         `data.repository.tags.edges[${data.path[3] - 1}].cursor`,
        //         lastCursor
        //       );

        //       component.includeTags(true, { after: cursor, total: 1 });
        //       return query
        //         .run((str) =>
        //           str
        //             .replace(/additions/i, '')
        //             .replace(/deletions/i, '')
        //             .replace(/changedFiles/i, '')
        //         )
        //         .then((result) =>
        //           set(
        //             error.response,
        //             `data.repository.tags.edges[${data.path[3]}]`,
        //             result.data.data.repository.tags.edges[0]
        //           )
        //         );
        //     });

        //     return Promise.resolve({ data: omit(error.response, 'errors') });
        //   }
        // }

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
