/*
 *  Author: Hudson S. Borges
 */
const Ajv = require('ajv');
const LfuSet = require('collections/lfu-set');

const { pick, isArray, isObjectLike, mapValues, isDate } = require('lodash');

const db = require('@gittrends/database-config');

class DAO {
  constructor(model, { cacheSize = 0 } = {}) {
    this.model = model;

    if (cacheSize > 0) {
      this.cache = new LfuSet([], cacheSize);
      this.model
        .query()
        .select(this.model.idColumn)
        .limit(cacheSize)
        .stream((stream) => {
          stream.on('data', (record) => (records) =>
            records.map((r) => this.cache.add(this._hash(r)))
          );
        });
    }

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

    return this.model
      .query(transaction)
      .insert(this._transform(nuRecords))
      .onConflict(this.model.idColumn)
      .ignore()
      .then((...result) => {
        if (this.cache) nuRecords.map((r) => this.cache.add(this._hash(r)));
        return Promise.resolve(...result);
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

const cacheEnabled = { cacheSize: parseInt(process.env.GITTRENDS_LFU_SIZE || 50000, 10) };

module.exports.actors = new DAO(db.Actor, cacheEnabled);
module.exports.commits = new DAO(db.Commit, cacheEnabled);
module.exports.dependencies = new DAO(db.Dependency);
module.exports.issues = new DAO(db.Issue);
module.exports.metadata = new DAO(db.Metadata);
module.exports.pulls = new DAO(db.PullRequest);
module.exports.reactions = new DAO(db.Reaction);
module.exports.releases = new DAO(db.Release);
module.exports.repositories = new DAO(db.Repository);
module.exports.stargazers = new DAO(db.Stargazer);
module.exports.tags = new DAO(db.Tag);
module.exports.timeline = new DAO(db.TimelineEvent);
module.exports.watchers = new DAO(db.Watcher);
