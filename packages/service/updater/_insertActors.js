/*
 *  Author: Hudson S. Borges
 */
const { Actor } = require('@gittrends/database-config');

const pRetry = require('promise-retry');
const Bottleneck = require('bottleneck');
const FastMap = require('collections/fast-map');
const LfuSet = require('collections/lfu-set');

const waiting = new FastMap();
const cache = new LfuSet([], 1000000);
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

module.exports = (users, transaction, replace = false) => {
  return limiter
    .schedule(() => {
      const promises = [];
      const nuUsers = [];

      users.forEach((user) => {
        if (cache.has(user.id)) return Promise.resolve();
        if (!replace && waiting.has(user.id)) return waiting.get(user.id);

        if (replace) {
          const promise = Actor.query(transaction)
            .update(user)
            .where('id', user.id)
            .then(() => cache.add(user.id))
            .finally(() => waiting.delete(user.id));

          waiting.set(user.id, promise);
          promises.push(promise);
        }

        return nuUsers.push(user);
      });

      const promise = insert(nuUsers, transaction)
        .then(() => cache.addEach(nuUsers.map((u) => u.id)))
        .finally(() => waiting.deleteEach(nuUsers.map((u) => u.id)));

      return promises.concat([promise]);
    })
    .then((promises) => Promise.all(promises));
};
