/*
 *  Author: Hudson S. Borges
 */
const { knex } = require('@gittrends/database-config');

const dao = require('./helper/dao');
const getTags = require('../github/graphql/repositories/tags.js');

const BATCH_SIZE = parseInt(process.env.GITTRENDS_BATCH_SIZE || 500, 10);

/* exports */
module.exports = async function (repositoryId) {
  const metaKey = { id: repositoryId, resource: 'tags' };
  const metadata = await dao.metadata.find({ ...metaKey, key: 'lastCursor' }).first();

  let lastCursor = (metadata && metadata.value) || null;

  for (let hasMore = true; hasMore; ) {
    const result = await getTags(repositoryId, { lastCursor, max: BATCH_SIZE });

    const tags = result.tags.map((t) => ({ repository: repositoryId, ...t }));
    const lastMeta = { key: 'lastCursor', value: (lastCursor = result.endCursor || lastCursor) };

    await knex.transaction(async (trx) => {
      await Promise.all([
        dao.actors.insert(result.users, trx),
        dao.commits.insert(result.commits, trx),
        dao.tags.insert(tags, trx),
        dao.metadata.upsert({ ...metaKey, ...lastMeta }, trx)
      ]);
    });

    hasMore = result.hasNextPage;
  }

  return dao.metadata.upsert({ ...metaKey, key: 'updatedAt', value: new Date().toISOString() });
};
