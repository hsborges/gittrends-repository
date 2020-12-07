/*
 *  Author: Hudson S. Borges
 */
const Ajv = require('ajv');
const retry = require('retry');
const LfuSet = require('collections/lfu-set');

const { pick, isArray, isObjectLike, mapValues, isDate } = require('lodash');

const db = require('@gittrends/database-config');

class DAO {
  constructor(model, { cacheSize = parseInt(process.env.GITTRENDS_LFU_SIZE || 50000, 10) } = {}) {
    this.cache = cacheSize === 0 ? null : new LfuSet([], cacheSize);
    this.model = model;

    this.validate = new Ajv({
      allErrors: true,
      removeAdditional: true,
      coerceTypes: true,
      useDefaults: true
    }).compile(this.model.jsonSchema);
  }

  _hash(record) {
    return Object.values(pick(record, this.model.idColumn)).join('.');
  }

  _transform(record) {
    if (isArray(record)) return record.map((r) => this._transform(r));

    const result = mapValues(record, (value) => {
      if (isDate(value)) return value.toISOString();
      if (isArray(value) || isObjectLike(value)) return JSON.stringify(value);
      // eslint-disable-next-line no-control-regex
      if (typeof value === 'string') return value.replace(/\u0000/g, '');
      return value;
    });

    if (!this.validate(result)) throw new Error(JSON.stringify(this.validate.errors));

    return result;
  }

  find(query, transaction) {
    return this.model.query(transaction).where(query);
  }

  insert(records, transaction) {
    const nuRecords = (isArray(records) ? records : [records]).filter(
      (record) => !(this.cache && this.cache.has(this._hash(record)))
    );

    return Promise.map(nuRecords, (record) =>
      new Promise((resolve, reject) => {
        const operation = retry.operation({ forever: true, maxTimeout: 1000, randomize: true });

        operation.attempt(() =>
          this.model
            .query(this.cache ? null : transaction)
            .insert(this._transform(record))
            .onConflict(this.model.idColumn)
            .ignore()
            .then(resolve)
            .catch((err) => {
              if (err.message.indexOf('deadlock') >= 0 && operation.retry(err)) return;
              return reject(operation.mainError() || err);
            })
        );
      }).then((...result) => {
        if (this.cache) this.cache.add(this._hash(record));
        return Promise.resolve(...result);
      })
    );
  }

  upsert(records, transaction) {
    return Promise.map(isArray(records) ? records : [records], (record) =>
      this.model
        .query(transaction)
        .insert(this._transform(record))
        .onConflict(this.model.idColumn)
        .merge()
    );
  }

  update(records, transaction) {
    return Promise.map(isArray(records) ? records : [records], (record) =>
      this.model
        .query(transaction)
        .update(this._transform(record))
        .where(pick(record, this.model.idColumn))
    );
  }

  delete(query, transaction) {
    return this.model.query(transaction).delete().where(query);
  }
}

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
