/*
 *  Author: Hudson S. Borges
 */
const { omit } = require('lodash');

module.exports = async ({ id, knex, mongo }) => {
  const users = await mongo.users
    .find(
      { _id: { $in: typeof id === 'string' ? [id] : id } },
      {
        projection: {
          _id: 1,
          login: 1,
          type: 1,
          name: 1,
          location: 1,
          avatar_url: 1,
          website_url: 1,
          repositories_count: 1,
          starred_repositories_count: 1,
          gists_count: 1,
          watching_count: 1,
          followers_count: 1,
          following_count: 1,
          created_at: 1,
          updated_at: 1
        }
      }
    )
    .toArray();

  if (users && users.length) {
    await Promise.map(users, async (user) =>
      knex.raw(
        `? ON CONFLICT (id)
            DO NOTHING
            RETURNING *;`,
        [knex('users').insert(omit({ id: user._id, ...user }, '_id'))]
      )
    );
  }
};
