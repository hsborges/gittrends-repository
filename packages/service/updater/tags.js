/*
 *  Author: Hudson S. Borges
 */
const { knex } = require('@gittrends/database-config');

const dao = require('./helper/dao');
const getTags = require('../github/graphql/repositories/tags.js');

/* exports */
module.exports = async function (repositoryId) {
  return knex.transaction(async (trx) => {
    const path = { id: repositoryId, resource: 'tags' };
    const metadata = await dao.metadata.find({ ...path, key: 'lastCursor' }).first();

    const lastCursor = metadata && metadata.value;
    const result = await getTags(repositoryId, { lastCursor });
    const rows = result.tags.map((t) => ({ repository: repositoryId, ...t }));

    await Promise.all([
      dao.actors.insert(result.users, trx),
      dao.commits.insert(result.commits, trx),
      dao.tags.insert(rows, trx)
    ]);

    return dao.metadata.upsert([
      { ...path, key: 'updatedAt', value: new Date().toISOString() },
      { ...path, key: 'lastCursor', value: result.endCursor || lastCursor }
    ]);
  });
};
