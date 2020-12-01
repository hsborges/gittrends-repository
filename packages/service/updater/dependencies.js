/*
 *  Author: Hudson S. Borges
 */
const { knex } = require('@gittrends/database-config');

const dao = require('./helper/dao');
const getDependencies = require('../github/graphql/repositories/dependencies.js');

/* exports */
module.exports = async function (repositoryId) {
  const meta = { id: repositoryId, resource: 'dependencies' };
  const { dependencies } = await getDependencies(repositoryId);

  return knex.transaction(async (trx) => {
    await dao.dependencies.delete({ repository: repositoryId }, trx);
    const rows = dependencies.map((d) => ({ repository: repositoryId, ...d }));
    return Promise.all([
      dao.dependencies.insert(rows, trx),
      dao.metadata.upsert({ ...meta, key: 'updatedAt', value: new Date().toISOString() }, trx)
    ]);
  });
};
