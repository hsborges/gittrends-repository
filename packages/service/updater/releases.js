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
    hasMore = await getReleases(repositoryId, { lastCursor, max: BATCH_SIZE }).then(
      async ({ releases, users, endCursor, hasNextPage }) =>
        knex
          .transaction((trx) =>
            Promise.all([
              insertUsers(users, trx),
              Release.query(trx)
                .insert(releases.map((r) => ({ repository: repositoryId, ...r })))
                .toKnexQuery()
                .onConflict('id')
                .ignore(),
              upsertMetadata(
                { ...path, key: 'lastCursor', value: (lastCursor = endCursor || lastCursor) },
                trx
              )
            ])
          )
          .then(() => hasNextPage)
    );
  }

  upsertMetadata({ ...path, key: 'updatedAt', value: new Date().toISOString() });
};
