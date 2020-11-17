/*
 *  Author: Hudson S. Borges
 */
const { isArray, get: getValue } = require('lodash');
const { Actor } = require('@gittrends/database-config');

const insertUsers = require('./_insertActors');
const get = require('../github/graphql/users/get.js');

const { NotFoundError } = require('../helpers/errors');

/* exports */
module.exports = async function (userId) {
  return get(isArray(userId) ? userId : [userId])
    .catch(async (err) => {
      if (err instanceof NotFoundError) {
        const ids = err.response.errors
          .filter((e) => e.type === 'NOT_FOUND')
          .map((e) => e.path[1])
          .map((i) => userId[i]);

        await Actor.query().delete().whereIn(ids);
        return { users: getValue(err, 'response.data.users', []) };
      }
      throw err;
    })
    .then((response) =>
      insertUsers(
        (isArray(userId) ? response.users : [response.user]).map((u) => ({
          ...u,
          _updated_at: new Date()
        })),
        null,
        true
      )
    );
};
