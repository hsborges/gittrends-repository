/*
 *  Author: Hudson S. Borges
 */
const { Actor } = require('@gittrends/database-config');
const pRetry = require('promise-retry');
const SortedSet = require('collections/sorted-set');

const running = new SortedSet();

module.exports = (users, transaction, replace = false) =>
  Promise.map(users, async (user) => {
    if (running.has(user.id)) return Promise.resolve();

    running.push(user.id);

    return pRetry(
      async function (retry) {
        try {
          if (replace) return Actor.query(transaction).update(user).where('id', user.id);
          return Actor.query(transaction).insert(user).toKnexQuery().onConflict('id').ignore();
        } catch (err) {
          if (err.message.indexOf('deadlock') >= 0) retry(err);
          throw err;
        }
      },
      { retries: 3, minTimeout: 100, randomize: true }
    ).finally(() => running.delete(user.id));
  });
