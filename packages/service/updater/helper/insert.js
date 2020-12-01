/*
 *  Author: Hudson S. Borges
 */
const { Actor, Commit } = require('@gittrends/database-config');

const pRetry = require('promise-retry');
const LfuSet = require('collections/lfu-set');

async function _retry(model, records) {
  return pRetry(
    async function (retry) {
      try {
        await model.query().insert(records).toKnexQuery().onConflict('id').ignore();
      } catch (err) {
        if (err.message.indexOf('deadlock') >= 0) retry(err);
        throw err;
      }
    },
    { retries: 3, minTimeout: 100, randomize: true }
  );
}

class Inserter {
  constructor(model) {
    this.cache = new LfuSet([], parseInt(process.env.GITTRENDS_LFU_SIZE || 50000, 10));
    this.model = model;
  }

  async insert(records, transaction, replace = false) {
    const nuRecords = records.reduce((mem, record) => {
      if (this.cache.has(record.id)) return mem;

      if (replace) {
        const promise = this.model
          .query(transaction)
          .update(record)
          .where('id', record.id)
          .then(() => this.cache.add(record.id));

        return mem.concat(promise);
      }

      return mem.concat([record]);
    }, []);

    await _retry(this.model, nuRecords);

    return this.cache.addEach(nuRecords.map((u) => u.id));
  }
}

module.exports.actors = new Inserter(Actor);
module.exports.commits = new Inserter(Commit);
