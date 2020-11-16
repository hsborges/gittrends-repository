/*
 *  Author: Hudson S. Borges
 */
const { knex, Metadata, Watcher } = require('@gittrends/database-config');

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
            insertUsers(users, trx).then(() =>
              Promise.all([
                Watcher.query(trx)
                  .insert(watchers.map((w) => ({ repository: repositoryId, ...w })))
                  .toKnexQuery()
                  .onConflict(['repository', 'user'])
                  .ignore(),
                Metadata.query(trx)
                  .insert([
                    {
                      ...metaPath,
                      key: 'lastCursor',
                      value: (lastCursor = endCursor || lastCursor)
                    },
                    hasNextPage
                      ? { ...metaPath, key: 'updatedAt', value: new Date().toISOString() }
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
