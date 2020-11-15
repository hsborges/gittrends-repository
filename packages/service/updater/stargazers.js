/*
 *  Author: Hudson S. Borges
 */
const { knex, Actor, Stargazer, Metadata } = require('@gittrends/database-config');

const getStargazers = require('../github/graphql/repositories/stargazers');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async function (repositoryId) {
  const metadata = await Metadata.query()
    .where({ id: repositoryId, resource: 'stargazers', key: 'lastCursor' })
    .first();

  let lastCursor = metadata && metadata.value;

  // repository modified
  for (let hasMore = true; hasMore; ) {
    hasMore = await getStargazers(repositoryId, { lastCursor, max: BATCH_SIZE }).then(
      async ({ stargazers, users, endCursor, hasNextPage }) => {
        await knex.transaction(async (trx) => {
          if (stargazers && stargazers.length) {
            await Promise.all([
              Actor.query(trx).insert(users).toKnexQuery().onConflict('id').ignore(),
              Stargazer.query(trx)
                .insert(stargazers.map((s) => ({ repository: repositoryId, ...s })))
                .toKnexQuery()
                .onConflict(['repository', 'user', 'starred_at'])
                .ignore()
            ]);
          }

          if (!hasNextPage) {
            await Metadata.query(trx)
              .insert({
                id: repositoryId,
                resource: 'stargazers',
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
              resource: 'stargazers',
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
