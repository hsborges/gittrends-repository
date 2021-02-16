/*
 *  Author: Hudson S. Borges
 */
import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { ClientSession, Collection, Cursor, Db } from 'mongodb';
import { cloneDeep, pick, omit, isArray, mapValues, isObject } from 'lodash';
import hash from 'object-hash';
import dayjs from 'dayjs';
import customParserForamt from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParserForamt);

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/i;

export class ValidationError extends Error {
  readonly object: TObject;
  readonly errorObject: ErrorObject[];

  constructor(object: TObject, error: ErrorObject[]) {
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

  private _validator: ValidateFunction<T> | undefined;

  constructor() {
    this._ajv = new Ajv({
      allErrors: true,
      coerceTypes: true,
      removeAdditional: true
    });

    addFormats(this._ajv);
  }

  private preValidate(data: unknown): unknown {
    if (data instanceof Date) return dayjs(data).format(DATE_FORMAT);
    if (isArray(data)) return data.map((d) => this.preValidate(d));
    if (isObject(data)) return mapValues(data, (value) => this.preValidate(value));
    return data;
  }

  private postValidate(data: unknown): unknown {
    if (typeof data === 'string' && DATE_REGEX.test(data)) return dayjs(data, DATE_FORMAT).toDate();
    if (isArray(data)) return data.map((d) => this.postValidate(d));
    if (isObject(data)) return mapValues(data, (value) => this.postValidate(value));
    return data;
  }

  protected validate(data: TObject): TObject & { _id?: string } {
    if (this._validator === undefined) this._validator = this._ajv.compile<T>(this.jsonSchema);

    let clone = this.preValidate(cloneDeep(data)) as TObject;
    if (!this._validator(clone))
      throw new ValidationError(clone, this._validator.errors as ErrorObject[]);

    clone = this.postValidate(clone) as TObject;

    if (typeof this.idField === 'string') {
      return omit({ _id: clone[this.idField] as string, ...clone }, this.idField);
    }

    return {
      _id: hash(pick(clone, this.idField), { algorithm: 'sha1', encoding: 'hex' }),
      ...clone
    };
  }

  get collection(): Collection {
    return Model.db.collection(this.collectionName);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async find(query: TObject, session?: ClientSession): Promise<Cursor<any>> {
    return this.collection.find(query, { session });
  }

  async insert(record: TObject | TObject[], session?: ClientSession): Promise<void> {
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

  async upsert(record: TObject | TObject[], session?: ClientSession): Promise<void> {
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
