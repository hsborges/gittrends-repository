/*
 *  Author: Hudson S. Borges
 */
const { knex, Stargazer, Metadata } = require('@gittrends/database-config');

const upsertMetadata = require('./_upsertMetadata');
const insertUsers = require('./_insertActors');
const getStargazers = require('../github/graphql/repositories/stargazers');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async function (repositoryId) {
  const meta = { id: repositoryId, resource: 'stargazers' };
  const metadata = await Metadata.query()
    .where({ ...meta, key: 'lastCursor' })
    .first();

  let lastCursor = metadata && metadata.value;

  // repository modified
  for (let hasMore = true; hasMore; ) {
    hasMore = await getStargazers(repositoryId, { lastCursor, max: BATCH_SIZE }).then(
      async ({ stargazers, users, endCursor, hasNextPage }) =>
        knex
          .transaction(async (trx) =>
            Promise.all([
              insertUsers(users, trx),
              Stargazer.query(trx)
                .insert(stargazers.map((s) => ({ repository: repositoryId, ...s })))
                .toKnexQuery()
                .onConflict(['repository', 'user', 'starred_at'])
                .ignore(),
              upsertMetadata(
                { ...meta, key: 'lastCursor', value: (lastCursor = endCursor || lastCursor) },
                trx
              )
            ])
          )
          .then(() => hasNextPage)
    );

    if (global.gc) global.gc();
  }

  return upsertMetadata({ ...meta, key: 'updatedAt', value: new Date().toISOString() });
};
