/*
 *  Author: Hudson S. Borges
 */
const pick = require('lodash/pick');
const isArray = require('lodash/isArray');
const pRetry = require('promise-retry');
const LfuSet = require('collections/lfu-set');

const db = require('@gittrends/database-config');

async function _retry(model, records, transaction) {
  return pRetry(
    async function (retry) {
      try {
        return model
          .query(transaction)
          .insert(records)
          .toKnexQuery()
          .onConflict(model.idColumn)
          .ignore();
      } catch (err) {
        if (err.message.indexOf('deadlock') >= 0) retry(err);
        throw err;
      }
    },
    { retries: 3, minTimeout: 100, randomize: true }
  );
}

class DAO {
  constructor(model, { cacheSize = parseInt(process.env.GITTRENDS_LFU_SIZE || 50000, 10) } = {}) {
    this.cache = cacheSize === 0 ? null : new LfuSet([], cacheSize);
    this.model = model;
  }

  _hash(record) {
    return Object.values(pick(record, this.model.idColumn)).join('.');
  }

  find(query, transaction) {
    return this.model.query(transaction).where(query);
  }

  insert(records, transaction) {
    const nuRecords = records.reduce((mem, record) => {
      if (this.cache && this.cache.has(this._hash(record))) return mem;
      return mem.concat([record]);
    }, []);

    return _retry(this.model, nuRecords, transaction).then((...results) => {
      if (this.cache) this.cache.addEach(nuRecords.map((u) => this._hash(u)));
      return results;
    });
  }

  upsert(records, transaction) {
    return this.model
      .query(transaction)
      .insert(records)
      .toKnexQuery()
      .onConflict(this.model.idColumn)
      .merge();
  }

  update(records, transaction) {
    return Promise.map(isArray(records) ? records : [records], (record) =>
      this.model.query(transaction).update(record).where(pick(record, this.model.idColumn))
    );
  }

  delete(query, transaction) {
    return this.model.query(transaction).delete().where(query);
  }
}

module.exports = DAO;
module.exports.actors = new DAO(db.Actor);
module.exports.commits = new DAO(db.Commit);
module.exports.dependencies = new DAO(db.Dependency, { cacheSize: 0 });
module.exports.issues = new DAO(db.Issue, { cacheSize: 0 });
module.exports.metadata = new DAO(db.Metadata, { cacheSize: 0 });
module.exports.pulls = new DAO(db.PullRequest, { cacheSize: 0 });
module.exports.reactions = new DAO(db.Reaction, { cacheSize: 0 });
module.exports.releases = new DAO(db.Release, { cacheSize: 0 });
module.exports.repositories = new DAO(db.Repository, { cacheSize: 0 });
module.exports.stargazers = new DAO(db.Stargazer, { cacheSize: 0 });
module.exports.tags = new DAO(db.Tag, { cacheSize: 0 });
module.exports.timeline = new DAO(db.TimelineEvent, { cacheSize: 0 });
module.exports.watchers = new DAO(db.Watcher, { cacheSize: 0 });