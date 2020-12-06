/*
 *  Author: Hudson S. Borges
 */
const { knex } = require('@gittrends/database-config');

const dao = require('./helper/dao');
const getWatchers = require('../github/graphql/repositories/watchers.js');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async function (repositoryId) {
  const metaKey = { id: repositoryId, resource: 'watchers' };
  const metadata = await dao.metadata.find({ ...metaKey, key: 'lastCursor' }).first();

  let lastCursor = (metadata && metadata.value) || null;

  for (let hasMore = true; hasMore; ) {
    const result = await getWatchers(repositoryId, { lastCursor, max: BATCH_SIZE });
    const rows = result.watchers.map((w) => ({ repository: repositoryId, ...w }));
    const lastMeta = { key: 'lastCursor', value: (lastCursor = result.endCursor || lastCursor) };

    await knex.transaction(async (trx) =>
      Promise.all([
        dao.actors.insert(result.users, trx),
        dao.watchers.insert(rows, trx),
        dao.metadata.upsert({ ...metaKey, ...lastMeta }, trx)
      ])
    );

    hasMore = result.hasNextPage;
  }

  return dao.metadata.upsert({ ...metaKey, key: 'updatedAt', value: new Date().toISOString() });
};
