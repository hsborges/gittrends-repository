/*
 *  Author: Hudson S. Borges
 */
const { knex, Metadata, Watcher } = require('@gittrends/database-config');

const upsertMetadata = require('./_upsertMetadata');
const insertUsers = require('./_insertActors');
const getWatchers = require('../github/graphql/repositories/watchers.js');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async function (repositoryId) {
  const meta = { id: repositoryId, resource: 'watchers' };
  const metadata = await Metadata.query()
    .where({ ...meta, key: 'lastCursor' })
    .first();

  let lastCursor = metadata && metadata.value;

  for (let hasMore = true; hasMore; ) {
    const result = await getWatchers(repositoryId, { lastCursor, max: BATCH_SIZE });

    await knex.transaction(async (trx) =>
      Promise.all([
        insertUsers(result.users, trx),
        Watcher.query(trx)
          .insert(result.watchers.map((w) => ({ repository: repositoryId, ...w })))
          .toKnexQuery()
          .onConflict(['repository', 'user'])
          .ignore(),
        upsertMetadata(
          { ...meta, key: 'lastCursor', value: (lastCursor = result.endCursor || lastCursor) },
          trx
        )
      ])
    );

    hasMore = result.hasNextPage;

    if (global.gc) global.gc();
  }

  return upsertMetadata({ ...meta, key: 'updatedAt', value: new Date().toISOString() });
};
