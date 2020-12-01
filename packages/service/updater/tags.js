/*
 *  Author: Hudson S. Borges
 */
const { knex, Tag, Metadata } = require('@gittrends/database-config');

const upsertMetadata = require('./_upsertMetadata');
const { actors, commits } = require('./helper/insert');
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
      actors.insert(result.users, trx),
      commits.insert(result.commits, trx),
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
