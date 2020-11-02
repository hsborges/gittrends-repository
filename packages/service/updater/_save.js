/*
 *  Author: Hudson S. Borges
 */
const { isArray, omit, compact } = require('lodash');

const { mongo } = require('@gittrends/database-config');

async function bulkWrite(collection, operations) {
  const _operations = compact(operations);

  if (_operations.length === 0) return Promise.resolve();

  return mongo[collection]
    .bulkWrite(_operations, { ordered: false })
    .catch((err) => (err.code === 11000 ? Promise.resolve() : Promise.reject(err)));
}

module.exports = {
  async users(users) {
    if (!users) throw new TypeError('Users must be a object or a non-empty list!');

    return bulkWrite(
      'users',
      (isArray(users) ? users : [users]).map((user) => {
        if (user._meta) {
          const filter = { _id: user.id };
          return { replaceOne: { filter, replacement: user, upsert: true } };
        }
        return {
          insertOne: { document: { ...omit(user, 'id'), _id: user.id } }
        };
      })
    );
  },

  async reactions(reactions) {
    return bulkWrite(
      'reactions',
      reactions.map((r) => ({
        replaceOne: {
          filter: { _id: r.id },
          replacement: omit(r, 'id'),
          upsert: true
        }
      }))
    );
  },

  async timeline(events) {
    return bulkWrite(
      'timeline',
      events.map((event) => ({
        replaceOne: {
          filter: { _id: event.id },
          replacement: omit(event, ['id', 'reaction_groups']),
          upsert: true
        }
      }))
    );
  },

  async commits(commits) {
    return bulkWrite(
      'commits',
      commits.map((commit) => ({
        replaceOne: {
          filter: { _id: commit.id },
          replacement: omit(commit, ['id']),
          upsert: true
        }
      }))
    );
  }
};
