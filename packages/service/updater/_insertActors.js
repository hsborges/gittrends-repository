/*
 *  Author: Hudson S. Borges
 */
const { Actor } = require('@gittrends/database-config');

const pRetry = require('promise-retry');
const Bottleneck = require('bottleneck');
const LfuSet = require('collections/lfu-set');

const cache = new LfuSet([], 100000);
const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 0 });

async function insert(user) {
  return pRetry(
    async function (retry) {
      try {
        await Actor.query().insert(user).toKnexQuery().onConflict('id').ignore();
      } catch (err) {
        if (err.message.indexOf('deadlock') >= 0) retry(err);
        throw err;
      }
    },
    { retries: 3, minTimeout: 100, randomize: true }
  );
}

module.exports = function (users, transaction, replace = false) {
  return limiter
    .schedule(() =>
      users.reduce((mem, user) => {
        if (cache.has(user.id)) return mem;

        if (replace) {
          const promise = Actor.query(transaction)
            .update(user)
            .where('id', user.id)
            .then(() => cache.add(user.id));

          return mem.concat(promise);
        }

        return mem.concat([user]);
      }, [])
    )
    .then((nuUsers) =>
      insert(nuUsers, transaction).then(() => cache.addEach(nuUsers.map((u) => u.id)))
    );
};
