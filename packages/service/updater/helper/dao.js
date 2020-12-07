/*
 *  Author: Hudson S. Borges
 */
const Ajv = require('ajv');
const async = require('async');
const retry = require('retry');
const LfuSet = require('collections/lfu-set');

const { pick, isArray, isObjectLike, mapValues, isDate } = require('lodash');

const db = require('@gittrends/database-config');

class DAO {
  constructor(
    model,
    {
      cacheSize = parseInt(process.env.GITTRENDS_LFU_SIZE || 50000, 10),
      queueSize = parseInt(process.env.GITTRENDS_QUEUE_WRITE || 1, 10)
    } = {}
  ) {
    this.cache = cacheSize === 0 ? null : new LfuSet([], cacheSize);
    this.model = model;

    this.queue = async.queue(
      (func, callback) =>
        func()
          .then((...res) => callback(null, ...res))
          .catch((err) => callback(err)),
      queueSize
    );

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

    return new Promise((resolve, reject) => {
      this.queue.push(
        () =>
          new Promise((resolve, reject) => {
            const operation = retry.operation({ forever: true, maxTimeout: 1000, randomize: true });

            operation.attempt(() =>
              this.model
                .query(this.cache ? null : transaction)
                .insert(this._transform(nuRecords))
                .onConflict(this.model.idColumn)
                .ignore()
                .then(resolve)
                .catch((err) => {
                  if (err.message.indexOf('deadlock') >= 0 && operation.retry(err)) return;
                  return reject(operation.mainError() || err);
                })
            );
          }).then((...result) => {
            if (this.cache) this.cache.addEach(nuRecords.map((r) => this._hash(r)));
            return Promise.resolve(...result);
          }),
        (err, res) => (err ? reject(err) : resolve(res))
      );
    });
  }

  upsert(records, transaction) {
    return this.model
      .query(transaction)
      .insert(this._transform(records))
      .onConflict(this.model.idColumn)
      .merge();
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

const disabled = { cacheSize: 0, queueSize: Number.MAX_SAFE_INTEGER };

module.exports.actors = new DAO(db.Actor);
module.exports.commits = new DAO(db.Commit);
module.exports.dependencies = new DAO(db.Dependency, disabled);
module.exports.issues = new DAO(db.Issue, disabled);
module.exports.metadata = new DAO(db.Metadata, disabled);
module.exports.pulls = new DAO(db.PullRequest, disabled);
module.exports.reactions = new DAO(db.Reaction, disabled);
module.exports.releases = new DAO(db.Release, disabled);
module.exports.repositories = new DAO(db.Repository, disabled);
module.exports.stargazers = new DAO(db.Stargazer, disabled);
module.exports.tags = new DAO(db.Tag, disabled);
module.exports.timeline = new DAO(db.TimelineEvent, disabled);
module.exports.watchers = new DAO(db.Watcher, disabled);
