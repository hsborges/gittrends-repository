/*
 *  Author: Hudson S. Borges
 */
const { get, chunk, isString } = require('lodash');

const client = require('../graphql-client.js');
const actorFragment = require('../fragments/actor.js');
const parser = require('../parser.js');
const { BadGatewayError } = require('../../../helpers/errors.js');

/* eslint-disable no-param-reassign */
module.exports = async function (reactables = []) {
  if (!reactables.length) return [];

  if (reactables.length > 100)
    return Promise.reduce(
      chunk(reactables, Math.min(100, Math.ceil(reactables.length / 2))),
      async (res, infoChunk) => res.concat(await module.exports(infoChunk)),
      []
    );

  const info = reactables.map((r) => (isString(r) ? { id: r } : r));

  const nodes = info
    .map((_info, index) => {
      if (_info.has_next_page === false) return '';
      const after = _info.end_cursor ? `, after: "${_info.end_cursor}"` : '';
      return `
      node_${index}:node(id: "${_info.id}") {
        type:__typename
        ... on Reactable {
          reactions(first: $total, orderBy: { field: CREATED_AT, direction: ASC }${after}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              content
              createdAt
              id
              user { ...actor }
            }
          }
        }
      }
    `;
    })
    .join(' ');

  const query = `query($total:Int = 100) { ${nodes} } ${actorFragment}`;

  return client
    .post({ query, variables: { total: 100 } })
    .then(async ({ data }) => {
      const reactions = info.map((_info, index) => {
        const result = parser(get(data, `data.node_${index}`, {}));
        const pageInfo = get(result, 'data.reactions.page_info', {});

        return {
          reactions: get(result, 'data.reactions.nodes', []),
          users: result.users || [],
          meta: { end_cursor: pageInfo.end_cursor || _info.end_cursor }
        };
      });

      const nextIteration = info.map((_info, index) => {
        const page = get(data, `data.node_${index}.reactions.page_info`, {});
        return {
          id: _info.id,
          end_cursor: page.end_cursor || _info.end_cursor,
          has_next_page: page.has_next_page || false
        };
      });

      if (nextIteration.reduce((a, m) => a || m.has_next_page, false)) {
        (await module.exports(nextIteration)).forEach((res, index) => {
          reactions[index].reactions.push(...res.reactions);
          reactions[index].users.push(...res.users);
          reactions[index].meta = res.meta;
        });
      }

      return reactions;
    })
    .catch((error) => {
      if (error instanceof BadGatewayError && info.length > 1)
        return Promise.reduce(
          chunk(info, Math.ceil(info.length / 2)),
          async (res, infoChunk) => res.concat(await module.exports(infoChunk)),
          []
        );
      throw error;
    });
};
