/*
 *  Author: Hudson S. Borges
 */
const Ajv = require('ajv').default;
const LfuSet = require('collections/lfu-set');
const ajvFormats = require('ajv-formats');

const { pick, isArray, isObjectLike, mapValues, isDate, chunk } = require('lodash');

module.exports = class AbstractDAO {
  constructor(model, { cacheSize = 0, chunkSize = 1000 } = {}) {
    this.model = model;
    this.chunkSize = chunkSize;

    if (cacheSize > 0) {
      this.cache = new LfuSet([], cacheSize);
      this.model
        .query()
        .select(this.model.idColumn)
        .limit(cacheSize)
        .stream((stream) => {
          stream.on('data', (r) => this.cache.add(this._hash(r)));
        });
    }

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
};
