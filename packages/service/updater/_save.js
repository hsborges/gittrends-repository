/*
 *  Author: Hudson S. Borges
 */
const { isArray, omit } = require('lodash');

const { mongo } = require('@monorepo/database-config');

module.exports = {
  async users(users) {
    if (!users) throw new TypeError('Users must be a object or a non-empty list!');

    if (isArray(users) && !users.length) return Promise.resolve();

    return mongo.users
      .bulkWrite(
        (isArray(users) ? users : [users]).map((user) => {
          if (user._meta) {
            const filter = { _id: user.id };
            return { replaceOne: { filter, replacement: user, upsert: true } };
          }
          return {
            insertOne: { document: { ...omit(user, 'id'), _id: user.id } }
          };
        }),
        { ordered: false }
      )
      .catch((err) => (err.code === 11000 ? Promise.resolve() : Promise.reject(err)));
  }
};
