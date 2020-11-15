/*
 *  Author: Hudson S. Borges
 */
const { knex, Actor, Metadata, Watcher } = require('@gittrends/database-config');

const getWatchers = require('../github/graphql/repositories/watchers.js');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async (repositoryId) => {
  const metadata = await Metadata.query()
    .where({ id: repositoryId, resource: 'watchers', key: 'lastCursor' })
    .first();

  let lastCursor = metadata && metadata.value;

  for (let hasMore = true; hasMore; ) {
    hasMore = await getWatchers(repositoryId, { lastCursor, max: BATCH_SIZE }).then(
      async ({ watchers, users, endCursor, hasNextPage }) => {
        await knex.transaction(async (trx) => {
          if (watchers && watchers.length) {
            await Promise.all([
              Actor.query(trx).insert(users).toKnexQuery().onConflict('id').ignore(),
              Watcher.query(trx)
                .insert(watchers.map((w) => ({ repository: repositoryId, ...w })))
                .toKnexQuery()
                .onConflict(['repository', 'user'])
                .ignore()
            ]);
          }

          if (!hasNextPage) {
            await Metadata.query(trx)
              .insert({
                id: repositoryId,
                resource: 'watchers',
                key: 'updatedAt',
                value: new Date().toISOString()
              })
              .toKnexQuery()
              .onConflict(['id', 'resource', 'key'])
              .merge();
          }

          await Metadata.query(trx)
            .insert({
              id: repositoryId,
              resource: 'watchers',
              key: 'lastCursor',
              value: (lastCursor = endCursor || lastCursor)
            })
            .toKnexQuery()
            .onConflict(['id', 'resource', 'key'])
            .merge();
        });

        return hasNextPage;
      }
    );
  }
};
