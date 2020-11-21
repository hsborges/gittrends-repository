/*
 *  Author: Hudson S. Borges
 */
const { knex, Dependency } = require('@gittrends/database-config');

const upsertMetadata = require('./_upsertMetadata');
const getDependencies = require('../github/graphql/repositories/dependencies.js');

/* exports */
module.exports = async (repositoryId) => {
  return getDependencies(repositoryId).then(async ({ dependencies }) =>
    knex.transaction(async (trx) => {
      await Dependency.query(trx).where({ repository: repositoryId }).delete();
      return Promise.all([
        Dependency.query(trx).insert(dependencies.map((d) => ({ repository: repositoryId, ...d }))),
        upsertMetadata(
          {
            id: repositoryId,
            resource: 'dependencies',
            key: 'updatedAt',
            value: new Date().toISOString()
          },
          trx
        )
      ]);
    })
  );
};
