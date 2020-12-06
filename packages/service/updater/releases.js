/*
 *  Author: Hudson S. Borges
 */
const { knex } = require('@gittrends/database-config');

const dao = require('./helper/dao');
const getReleases = require('../github/graphql/repositories/releases.js');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async function (repositoryId) {
  const path = { id: repositoryId, resource: 'releases' };
  const metadata = await dao.metadata.find({ ...path, key: 'lastCursor' }).first();

  let lastCursor = (metadata && metadata.value) || null;

  // modified or not updated
  for (let hasMore = true; hasMore; ) {
    const result = await getReleases(repositoryId, { lastCursor, max: BATCH_SIZE });

    const rows = result.releases.map((r) => ({ repository: repositoryId, ...r }));
    const lastMeta = { key: 'lastCursor', value: (lastCursor = result.endCursor || lastCursor) };

    await knex.transaction((trx) =>
      Promise.all([
        dao.actors.insert(result.users, trx),
        dao.releases.insert(rows, trx),
        dao.metadata.upsert({ ...path, ...lastMeta }, trx)
      ])
    );

    hasMore = result.hasNextPage;
  }

  return dao.metadata.upsert({ ...path, key: 'updatedAt', value: new Date().toISOString() });
};
