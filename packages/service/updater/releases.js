/*
 *  Author: Hudson S. Borges
 */
const { knex, Release, Metadata } = require('@gittrends/database-config');

const upsertMetadata = require('./_upsertMetadata');
const insertUsers = require('./_insertActors');
const getReleases = require('../github/graphql/repositories/releases.js');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async function (repositoryId) {
  const path = { id: repositoryId, resource: 'releases' };

  const metadata = await Metadata.query()
    .where({ ...path, key: 'lastCursor' })
    .first();

  let lastCursor = metadata && metadata.value;

  // modified or not updated
  for (let hasMore = true; hasMore; ) {
    const result = await getReleases(repositoryId, { lastCursor, max: BATCH_SIZE });

    await knex.transaction((trx) =>
      Promise.all([
        insertUsers(result.users, trx),
        Release.query(trx)
          .insert(result.releases.map((r) => ({ repository: repositoryId, ...r })))
          .toKnexQuery()
          .onConflict('id')
          .ignore(),
        upsertMetadata(
          { ...path, key: 'lastCursor', value: (lastCursor = result.endCursor || lastCursor) },
          trx
        )
      ])
    );

    hasMore = result.hasNextPage;

    if (global.gc) global.gc();
  }

  return upsertMetadata({ ...path, key: 'updatedAt', value: new Date().toISOString() });
};
