/*
 *  Author: Hudson S. Borges
 */
const { knex, Actor, Release, Metadata } = require('@gittrends/database-config');

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
              Actor.query(trx).insert(users).toKnexQuery().onConflict('id').ignore(),
              Release.query(trx)
                .insert(releases.map((r) => ({ repository: repositoryId, ...r })))
                .toKnexQuery()
                .onConflict('id')
                .ignore(),
              Metadata.query(trx)
                .insert([
                  { ...path, key: 'lastCursor', value: (lastCursor = endCursor || lastCursor) },
                  ...(hasNextPage
                    ? [{ ...path, key: 'updatedAt', value: new Date().toISOString() }]
                    : [])
                ])
                .toKnexQuery()
                .onConflict(['id', 'resource', 'key'])
                .merge()
            ])
          )
          .then(() => hasNextPage)
    );
  }
};
