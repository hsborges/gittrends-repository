/*
 *  Author: Hudson S. Borges
 */
const Ajv = require('ajv').default;
const LfuSet = require('collections/lfu-set');
const ajvFormats = require('ajv-formats');

const { pick, isArray, isObjectLike, mapValues, isDate, chunk } = require('lodash');

const db = require('@gittrends/database-config');

class DAO {
  constructor(model, { cacheSize = 0, chunkSize = 1000 } = {}) {
    this.model = model;
    this.chunkSize = chunkSize;

    if (cacheSize > 0) this.cache = new LfuSet([], cacheSize);

    const ajv = new Ajv({
      allErrors: true,
      removeAdditional: true,
      coerceTypes: true,
      useDefaults: true
    });
    ajvFormats(ajv);

    this.validate = ajv.compile(this.model.jsonSchema);
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

    return Promise.map(chunk(nuRecords, this.chunkSize), (group) =>
      this.model
        .query(transaction)
        .insert(this._transform(group))
        .onConflict(this.model.idColumn)
        .ignore()
        .then((...result) => {
          if (this.cache) nuRecords.map((r) => this.cache.add(this._hash(r)));
          return Promise.resolve(...result);
        })
    );
  }

  upsert(records, transaction) {
    return Promise.map(chunk(isArray(records) ? records : [records], this.chunkSize), (group) =>
      this.model
        .query(transaction)
        .insert(this._transform(group))
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

// Disable cache by default
const defaultOptions = {
  cacheSize: 0,
  chunkSize: parseInt(process.env.GITTRENDS_DAO_CHUNK_SIZE || 1000, 10)
};

const cacheEnabled = {
  ...defaultOptions,
  cacheSize: parseInt(process.env.GITTRENDS_DAO_CACHE_SIZE || 50000, 10)
};

// exports
module.exports.actors = new DAO(db.Actor, cacheEnabled);
module.exports.commits = new DAO(db.Commit, cacheEnabled);
module.exports.dependencies = new DAO(db.Dependency, defaultOptions);
module.exports.issues = new DAO(db.Issue, defaultOptions);
module.exports.metadata = new DAO(db.Metadata, defaultOptions);
module.exports.pulls = new DAO(db.PullRequest, defaultOptions);
module.exports.reactions = new DAO(db.Reaction, defaultOptions);
module.exports.releases = new DAO(db.Release, defaultOptions);
module.exports.repositories = new DAO(db.Repository, defaultOptions);
module.exports.stargazers = new DAO(db.Stargazer, defaultOptions);
module.exports.tags = new DAO(db.Tag, defaultOptions);
module.exports.timeline = new DAO(db.TimelineEvent, defaultOptions);
module.exports.watchers = new DAO(db.Watcher, defaultOptions);
