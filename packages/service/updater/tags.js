/*
 *  Author: Hudson S. Borges
 */
const { knex, Commit, Tag, Metadata } = require('@gittrends/database-config');

const upsertMetadata = require('./_upsertMetadata');
const insertUsers = require('./_insertActors');
const getTags = require('../github/graphql/repositories/tags.js');

/* exports */
module.exports = async function (repositoryId) {
  return knex.transaction(async (trx) => {
    const path = { id: repositoryId, resource: 'tags' };
    const metadata = await Metadata.query(trx)
      .where({ ...path, key: 'lastCursor' })
      .first();

    const lastCursor = metadata && metadata.value;
    const result = await getTags(repositoryId, { lastCursor });

    await Promise.all([
      insertUsers(result.users, trx),
      Promise.map(result.commits, (commit) =>
        Commit.query(trx).insert(commit).toKnexQuery().onConflict('id').ignore()
      ),
      Promise.map(
        result.tags.map((t) => ({ repository: repositoryId, ...t })),
        (tag) => Tag.query(trx).insert(tag).toKnexQuery().onConflict('id').ignore()
      )
    ]);

    return upsertMetadata([
      { ...path, key: 'updatedAt', value: new Date().toISOString() },
      { ...path, key: 'lastCursor', value: result.endCursor || lastCursor }
    ]);
  });
};
