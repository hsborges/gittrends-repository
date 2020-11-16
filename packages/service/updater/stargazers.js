/*
 *  Author: Hudson S. Borges
 */
const { knex, Stargazer, Metadata } = require('@gittrends/database-config');

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
            insertUsers(users, trx).then(() =>
              Promise.all([
                Stargazer.query(trx)
                  .insert(stargazers.map((s) => ({ repository: repositoryId, ...s })))
                  .toKnexQuery()
                  .onConflict(['repository', 'user', 'starred_at'])
                  .ignore(),
                Metadata.query(trx)
                  .insert([
                    { ...meta, key: 'lastCursor', value: (lastCursor = endCursor || lastCursor) },
                    hasNextPage
                      ? { ...meta, key: 'updatedAt', value: new Date().toISOString() }
                      : {}
                  ])
                  .toKnexQuery()
                  .onConflict(['id', 'resource', 'key'])
                  .merge()
              ])
            )
          )
          .then(() => hasNextPage)
    );
  }
};
