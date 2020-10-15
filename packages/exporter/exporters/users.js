/*
 *  Author: Hudson S. Borges
 */
const { omit } = require('lodash');

module.exports = async ({ knex, mongo, BATCH_SIZE = 50 }) => {
  const cursor = mongo.users.find(
    {},
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
  );

  let user = null;
  let batch = [];
  do {
    user = await cursor.next();

    if (user && batch.length < BATCH_SIZE) {
      batch.push(user);
    } else if (batch.length) {
      await knex.batchInsert(
        'users',
        batch.map((u) => omit({ id: u._id, ...u }, '_id'))
      );
      batch = [];
    }
  } while (user);
};
