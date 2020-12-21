/*
 *  Author: Hudson S. Borges
 */
const { get, chain, chunk } = require('lodash');
const { BadGatewayError } = require('../../../helpers/errors.js');

const Query = require('../Query');
const ReactionComponent = require('../components/ReactionComponent');

/* eslint-disable no-param-reassign */
module.exports = async function (reactables = []) {
  if (!reactables) return {};

  if (!Array.isArray(reactables)) module.exports([reactables]);
  if (!reactables.length) return {};

  if (reactables.length > 100)
    return Promise.reduce(
      chunk(reactables, Math.min(100, Math.ceil(reactables.length / 2))),
      async (res, infoChunk) => {
        const partialResult = await module.exports(infoChunk);
        res.reactions.concat(partialResult.reactions);
        res.users = chain(res.users.concat(partialResult.users)).compact().uniqBy('id').value();
        return res;
      },
      { reactions: [], users: [] }
    );

  let components = reactables.map((id, index) =>
    ReactionComponent.with({ id, name: `reactable_${index}` }).includeReactions()
  );

  const reactions = [];
  const users = [];

  for (; components.length > 0; ) {
    await Query.create()
      .compose(...components)
      .then(({ data, users: _users = [] }) => {
        users.push(..._users);

        components = components.filter((component) => {
          const pageInfoPath = `${component.name}.reactions.page_info`;

          const endCursor = get(data, `${pageInfoPath}.end_cursor`);
          component.includeReactions(true, { after: endCursor });

          reactions.push(
            ...get(data, `${component.name}.reactions.nodes`, []).map((reaction) => ({
              reactable: component.id,
              ...reaction
            }))
          );

          return get(data, `${pageInfoPath}.has_next_page`, false);
        });
      })
      .catch((error) => {
        if (error instanceof BadGatewayError && reactables.length > 1) {
          return Promise.mapSeries(
            chunk(reactables, Math.ceil(reactables.length / 2)),
            async (infoChunk) =>
              module.exports(infoChunk).then((response) => {
                reactions.push(...(response.reactions || []));
                users.push(...(response.users || []));
              })
          );
        }
        throw error;
      });
  }

  return {
    reactions,
    users: chain(users).compact().uniqBy('id').value()
  };
};
