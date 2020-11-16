/*
 *  Author: Hudson S. Borges
 */
const { knex, Dependency, Metadata } = require('@gittrends/database-config');

const getDependencies = require('../github/graphql/repositories/dependencies.js');

/* exports */
module.exports = async (repositoryId) => {
  return getDependencies(repositoryId).then(async ({ dependencies }) =>
    knex.transaction(async (trx) =>
      Dependency.query(trx)
        .where({ repository: repositoryId })
        .delete()
        .then(() =>
          Promise.all([
            Dependency.query(trx).insert(
              dependencies.map((d) => ({ repository: repositoryId, ...d }))
            ),
            Metadata.query(trx)
              .insert({
                id: repositoryId,
                resource: 'dependencies',
                key: 'updatedAt',
                value: new Date().toISOString()
              })
              .toKnexQuery()
              .onConflict(['id', 'resource', 'key'])
              .merge()
          ])
        )
    )
  );
};
