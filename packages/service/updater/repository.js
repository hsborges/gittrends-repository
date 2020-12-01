/*
 *  Author: Hudson S. Borges
 */
const { knex } = require('@gittrends/database-config');

const dao = require('./helper/dao');
const get = require('../github/graphql/repositories/get');
const { NotFoundError, BlockedError } = require('../helpers/errors');

/* exports */
module.exports = async function (repositoryId) {
  return get(repositoryId)
    .then(({ repository, users }) =>
      knex.transaction(async (trx) =>
        Promise.all([
          dao.actors.insert(users, trx),
          dao.repositories.update(repository, trx),
          dao.metadata.upsert({
            id: repositoryId,
            resource: 'repos',
            key: 'updatedAt',
            value: new Date().toISOString()
          })
        ])
      )
    )
    .catch(async (err) => {
      // TODO - add an specific field instead of delete
      if (err instanceof NotFoundError || err instanceof BlockedError)
        await dao.repositories.delete({ id: repositoryId });
      throw err;
    });
};
