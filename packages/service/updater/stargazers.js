/*
 *  Author: Hudson S. Borges
 */
const { knex } = require('@gittrends/database-config');

const dao = require('./helper/dao');
const getStargazers = require('../github/graphql/repositories/stargazers');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async function (repositoryId) {
  const meta = { id: repositoryId, resource: 'stargazers' };
  const metadata = await dao.metadata.find({ ...meta, key: 'lastCursor' }).first();

  let lastCursor = metadata && metadata.value;

  // repository modified
  for (let hasMore = true; hasMore; ) {
    const response = await getStargazers(repositoryId, { lastCursor, max: BATCH_SIZE });

    const rows = response.stargazers.map((s) => ({ repository: repositoryId, ...s }));
    const lastMeta = { key: 'lastCursor', value: (lastCursor = response.endCursor || lastCursor) };

    await knex.transaction(async (trx) =>
      Promise.all([
        dao.actors.insert(response.users, trx),
        dao.stargazers.insert(rows, trx),
        dao.metadata.upsert({ ...meta, ...lastMeta }, trx)
      ])
    );

    hasMore = response.hasNextPage;

    if (global.gc) global.gc();
  }

  return dao.metadata.upsert({ ...meta, key: 'updatedAt', value: new Date().toISOString() });
};
