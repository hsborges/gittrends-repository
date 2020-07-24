/*
 *  Author: Hudson S. Borges
 */
const { omit } = require('lodash');

module.exports = async ({ knex, mongo, BATCH_SIZE = 25000 }) => {
  await knex.raw('ALTER TABLE users DISABLE TRIGGER ALL;');
  await knex('users').delete();

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
      },
      batchSize: BATCH_SIZE
    }
  );

  let batch = [];
  while (await cursor.hasNext()) {
    batch.push(await cursor.next());
    if (batch.length === BATCH_SIZE) {
      await knex.batchInsert(
        'users',
        batch.map((user) => omit({ id: user._id, ...user }, '_id'))
      );
      batch = [];
    }
  }

  if (batch.length > 0)
    await knex.batchInsert(
      'users',
      batch.map((user) => omit({ id: user._id, ...user }, '_id'))
    );

  await knex.raw('ALTER TABLE users ENABLE TRIGGER ALL;');
};
