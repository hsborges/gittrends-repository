/*
 *  Author: Hudson S. Borges
 */
const { knex, Metadata, Watcher } = require('@gittrends/database-config');

const upsertMetadata = require('./_upsertMetadata');
const insertUsers = require('./_insertActors');
const getWatchers = require('../github/graphql/repositories/watchers.js');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async (repositoryId) => {
  const metaPath = { id: repositoryId, resource: 'watchers' };
  const metadata = await Metadata.query()
    .where({ ...metaPath, key: 'lastCursor' })
    .first();

  let lastCursor = metadata && metadata.value;

  for (let hasMore = true; hasMore; ) {
    hasMore = await getWatchers(repositoryId, { lastCursor, max: BATCH_SIZE }).then(
      async ({ watchers, users, endCursor, hasNextPage }) =>
        knex
          .transaction(async (trx) =>
            Promise.all([
              insertUsers(users, trx),
              Watcher.query(trx)
                .insert(watchers.map((w) => ({ repository: repositoryId, ...w })))
                .toKnexQuery()
                .onConflict(['repository', 'user'])
                .ignore(),
              upsertMetadata(
                { ...metaPath, key: 'lastCursor', value: (lastCursor = endCursor || lastCursor) },
                trx
              )
            ])
          )
          .then(() => hasNextPage)
    );
  }

  return upsertMetadata({ ...metaPath, key: 'updatedAt', value: new Date().toISOString() });
};
