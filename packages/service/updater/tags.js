/*
 *  Author: Hudson S. Borges
 */
const { knex, Actor, Commit, Tag, Metadata } = require('@gittrends/database-config');

const getTags = require('../github/graphql/repositories/tags.js');

/* exports */
module.exports = async (repositoryId) => {
  return knex.transaction(async (trx) => {
    const path = { id: repositoryId, resource: 'tags' };

    const metadata = await Metadata.query(trx)
      .where({ ...path, key: 'lastCursor' })
      .first();

    let lastCursor = metadata && metadata.value;

    await getTags(repositoryId, { lastCursor }).then(
      async ({ tags, commits, users, endCursor }) => {
        await Promise.all([
          Actor.query(trx).insert(users).toKnexQuery().onConflict('id').ignore(),
          Commit.query(trx).insert(commits).toKnexQuery().onConflict('id').ignore(),
          Tag.query(trx)
            .insert(tags.map((t) => ({ repository: repositoryId, ...t })))
            .toKnexQuery()
            .onConflict('id')
            .ignore()
        ]);

        lastCursor = endCursor || lastCursor;
      }
    );

    return Metadata.query(trx).insert([
      { ...path, key: 'updatedAt', value: new Date().toISOString() },
      { ...path, key: 'lastCursor', value: lastCursor }
    ]);
  });
};
