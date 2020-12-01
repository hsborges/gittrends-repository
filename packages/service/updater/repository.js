/*
 *  Author: Hudson S. Borges
 */
const { knex, Repository, Metadata } = require('@gittrends/database-config');

const { actors } = require('./helper/insert');
const get = require('../github/graphql/repositories/get');
const { NotFoundError, BlockedError } = require('../helpers/errors');

/* exports */
module.exports = async function (repositoryId) {
  return get(repositoryId)
    .then(({ repository, users }) =>
      knex.transaction(async (trx) =>
        actors.insert(users, trx).then(() =>
          Promise.all([
            Repository.query(trx).findById(repositoryId).update(repository),
            Metadata.query(trx)
              .insert({
                id: repositoryId,
                resource: 'repos',
                key: 'updatedAt',
                value: new Date().toISOString()
              })
              .toKnexQuery()
              .onConflict(['id', 'resource', 'key'])
              .merge()
          ])
        )
      )
    )
    .catch(async (err) => {
      // TODO - add an specific field instead of delete
      if (err instanceof NotFoundError || err instanceof BlockedError)
        await Repository.query().deleteById(repositoryId);
      throw err;
    });
};
