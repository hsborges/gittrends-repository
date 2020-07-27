/*
 *  Author: Hudson S. Borges
 */
const { isArray, get: getValue } = require('lodash');
const { mongo } = require('@gittrends/database-config');

const save = require('./_save.js');
const get = require('../github/graphql/users/get.js');

const { NotFoundError } = require('../helpers/errors');

/* exports */
module.exports = async function (userId) {
  return get(userId)
    .catch(async (err) => {
      if (isArray(userId) && err instanceof NotFoundError) {
        const ids = err.response.errors
          .filter((e) => e.type === 'NOT_FOUND')
          .map((e) => e.path[1])
          .map((i) => userId[i]);

        await mongo.users.updateMany(
          { _id: { $in: ids } },
          { $set: { _meta: { removed: true, updated_at: new Date() } } }
        );
        return { users: getValue(err, 'response.data.users', []) };
      }
      throw err;
    })
    .then((response) =>
      save.users(
        (isArray(userId) ? response.users : [response.user]).map((u) => ({
          ...u,
          _meta: { updated_at: new Date() }
        }))
      )
    )
    .catch((err) => {
      if (!isArray(userId) && err instanceof NotFoundError) {
        return mongo.users.updateOne(
          { _id: userId },
          { $set: { _meta: { removed: true, updated_at: new Date() } } }
        );
      }
      throw err;
    });
};
