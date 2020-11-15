/*
 *  Author: Hudson S. Borges
 */
const { knex, Actor, Repository, Metadata } = require('@gittrends/database-config');

const get = require('../github/graphql/repositories/get');
const { NotFoundError, BlockedError } = require('../helpers/errors');

/* exports */
module.exports = async function (repositoryId) {
  return get(repositoryId)
    .then(({ repository, users }) =>
      knex.transaction(async (trx) =>
        Promise.all([
          Actor.query(trx).insert(users).toKnexQuery().onConflict('id').ignore(),
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
    .catch(async (err) => {
      // TODO - add an specific field instead of delete
      if (err instanceof NotFoundError || err instanceof BlockedError)
        await Repository.query().deleteById(repositoryId);
      throw err;
    });
};
