/*
 *  Author: Hudson S. Borges
 */
const { knex, Commit, Tag, Metadata } = require('@gittrends/database-config');

const upsertMetadata = require('./_upsertMetadata');
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
      Promise.all([
        insertUsers(users, trx),
        Promise.map(commits, (commit) =>
          Commit.query(trx).insert(commit).toKnexQuery().onConflict('id').ignore()
        ),
        Promise.map(
          tags.map((t) => ({ repository: repositoryId, ...t })),
          (tag) => Tag.query(trx).insert(tag).toKnexQuery().onConflict('id').ignore()
        )
      ]).then(() => (lastCursor = endCursor || lastCursor))
    );

    return upsertMetadata([
      { ...path, key: 'updatedAt', value: new Date().toISOString() },
      { ...path, key: 'lastCursor', value: lastCursor }
    ]);
  });
};
