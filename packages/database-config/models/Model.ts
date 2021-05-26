/*
 *  Author: Hudson S. Borges
 */
import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { ClientSession, Collection, Cursor, Db } from 'mongodb';
import { cloneDeep, isArray, mapValues, isObject, pick, omit } from 'lodash';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/i;

export class ValidationError extends Error {
  readonly object: any;
  readonly errorObject: ErrorObject[];

  constructor(object: any, error: ErrorObject[]) {
    super(JSON.stringify({ error, object }));
    this.object = object;
    this.errorObject = error;
  }
}

export default abstract class Model<T = void> {
  static db: Db;

  abstract get collectionName(): string;
  abstract get idField(): string | string[];
  abstract get jsonSchema(): Record<string, unknown>;

  private readonly _ajv: Ajv;

  private _validator?: ValidateFunction<T>;

  constructor() {
    this._ajv = new Ajv({
      allErrors: true,
      coerceTypes: true,
      removeAdditional: true
    });

    addFormats(this._ajv);
  }

  private preValidate(data: any): any {
    if (data instanceof Date) return data.toISOString();
    if (isArray(data)) return data.map((d) => this.preValidate(d));
    if (isObject(data)) return mapValues(data, (value) => this.preValidate(value));
    return data;
  }

  private postValidate(data: any): any {
    if (isArray(data)) return data.map((d) => this.postValidate(d));
    if (isObject(data)) return mapValues(data, (value) => this.postValidate(value));
    if (typeof data === 'string' && DATE_REGEX.test(data)) return new Date(data);
    return data;
  }

  protected validate(data: any): any & { _id?: string } {
    if (!this._validator) this._validator = this._ajv.compile<T>(this.jsonSchema);

    let clone = this.preValidate(cloneDeep(data)) as any;

    if (!clone._id) {
      clone = {
        _id: typeof this.idField === 'string' ? clone[this.idField] : pick(clone, this.idField),
        ...omit(clone, this.idField)
      };
    }

    if (!this._validator(clone))
      throw new ValidationError(clone, this._validator.errors as ErrorObject[]);

    return this.postValidate(clone);
  }

  get collection(): Collection {
    return Model.db.collection(this.collectionName);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async find(query: any, session?: ClientSession): Promise<Cursor<any>> {
    return this.collection.find(query, { session });
  }

  async insert(record: any | any[], session?: ClientSession): Promise<void> {
    const records = (Array.isArray(record) ? record : [record]).map((data) => this.validate(data));
    if (!records.length) return;

    await this.collection
      .bulkWrite(
        records.map((record) => ({ insertOne: { document: record } })),
        { session, ordered: false }
      )
      .catch((err) => {
        if (err.code && err.code === 11000) return;
        else throw err;
      });
  }

  async upsert(record: any | any[], session?: ClientSession): Promise<void> {
    const records = (Array.isArray(record) ? record : [record]).map((data) => this.validate(data));
    if (!records.length) return;

    await this.collection.bulkWrite(
      records.map((record) => ({
        replaceOne: { filter: { _id: record._id }, replacement: record, upsert: true }
      })),
      { session, ordered: false }
    );
  }
}
