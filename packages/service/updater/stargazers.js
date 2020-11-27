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
    const response = await getStargazers(repositoryId, { lastCursor, max: BATCH_SIZE });

    await knex.transaction(async (trx) =>
      Promise.all([
        insertUsers(response.users, trx),
        Stargazer.query(trx)
          .insert(response.stargazers.map((s) => ({ repository: repositoryId, ...s })))
          .toKnexQuery()
          .onConflict(['repository', 'user', 'starred_at'])
          .ignore(),
        upsertMetadata(
          { ...meta, key: 'lastCursor', value: (lastCursor = response.endCursor || lastCursor) },
          trx
        )
      ])
    );

    hasMore = response.hasNextPage;

    if (global.gc) global.gc();
  }

  return upsertMetadata({ ...meta, key: 'updatedAt', value: new Date().toISOString() });
};
