/*
 *  Author: Hudson S. Borges
 */
const { knex, Commit, Tag, Metadata } = require('@gittrends/database-config');

const insertUsers = require('./_insertActors');
const getTags = require('../github/graphql/repositories/tags.js');

/* exports */
module.exports = async (repositoryId) => {
  return knex.transaction(async (trx) => {
    const path = { id: repositoryId, resource: 'tags' };

    const metadata = await Metadata.query(trx)
      .where({ ...path, key: 'lastCursor' })
      .first();

    let lastCursor = metadata && metadata.value;

    await getTags(repositoryId, { lastCursor }).then(async ({ tags, commits, users, endCursor }) =>
      insertUsers(users, trx)
        .then(() =>
          Promise.all([
            Commit.query(trx).insert(commits).toKnexQuery().onConflict('id').ignore(),
            Tag.query(trx)
              .insert(tags.map((t) => ({ repository: repositoryId, ...t })))
              .toKnexQuery()
              .onConflict('id')
              .ignore()
          ])
        )
        .then(() => (lastCursor = endCursor || lastCursor))
    );

    return Metadata.query(trx).insert([
      { ...path, key: 'updatedAt', value: new Date().toISOString() },
      { ...path, key: 'lastCursor', value: lastCursor }
    ]);
  });
};
