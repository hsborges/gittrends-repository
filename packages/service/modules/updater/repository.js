/*
 *  Author: Hudson S. Borges
 */
const { omit } = require('lodash');

const db = require('../connection.js');
const save = require('./_save.js');
const get = require('../github/graphql/repositories/get');
const { NotFoundError, BlockedError } = require('../errors');

/* exports */
module.exports = async function (repositoryId) {
  const repo = await db.repositories.findOne({ _id: repositoryId }, { projection: { _meta: 1 } });

  return get(repo._id)
    .then(({ repository, users }) =>
      Promise.all([
        db.repositories.replaceOne(
          { _id: repository.id },
          { ...omit(repository, 'id'), _meta: { ...repo._meta, updated_at: new Date() } }
        ),
        save.users(users)
      ])
    )
    .catch((err) => {
      if (err instanceof NotFoundError) {
        return db.repositories.updateOne(
          { _id: repo._id },
          { $set: { '_meta.removed': true, '_meta.removed_at': new Date() } }
        );
      }
      if (err instanceof BlockedError) {
        return db.repositories.updateOne(
          { _id: repo._id },
          {
            $set: {
              '_meta.removed': true,
              '_meta.removed_at': new Date(),
              '_meta.removed_reason': 'blocked'
            }
          }
        );
      }
      throw err;
    });
};
