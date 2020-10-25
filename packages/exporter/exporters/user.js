/*
 *  Author: Hudson S. Borges
 */
const { omit } = require('lodash');

const fields = [
  'login',
  'type',
  'name',
  'location',
  'avatar_url',
  'website_url',
  'repositories_count',
  'starred_repositories_count',
  'gists_count',
  'watching_count',
  'followers_count',
  'following_count',
  'created_at',
  'updated_at'
];

module.exports = async ({ id, knex, mongo, updateOnConflict = false }) => {
  const users = await mongo.users
    .find(
      { _id: { $in: typeof id === 'string' ? [id] : id } },
      {
        projection: {
          _id: 1,
          ...fields.reduce((o, f) => ({ ...o, [f]: 1 }), {})
        }
      }
    )
    .toArray();

  if (users && users.length) {
    await Promise.map(users, async (user) =>
      knex.raw(
        `? ON CONFLICT (id)
           DO ${
             updateOnConflict
               ? `UPDATE SET ${fields.map((f) => `${f} = EXCLUDED.${f}`).join(', ')}`
               : 'NOTHING'
           }
        `,
        [knex('users').insert(omit({ id: user._id, ...user }, '_id'))]
      )
    );
  }
};
