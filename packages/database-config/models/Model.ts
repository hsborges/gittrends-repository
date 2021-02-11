import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { ClientSession, Collection, Cursor, Db } from 'mongodb';
import { cloneDeep, pick, omit, isArray, mapValues, isObject } from 'lodash';
import hash from 'object-hash';
import dayjs from 'dayjs';
import customParserForamt from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParserForamt);

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

  constructor(removeAdditional = true) {
    this._ajv = new Ajv({
      allErrors: true,
      coerceTypes: true,
      removeAdditional: removeAdditional ? 'all' : undefined
    });

    addFormats(this._ajv);
  }

  private preValidate(data: unknown): unknown {
    if (data instanceof Date) return data.toISOString();
    if (isArray(data)) return data.map((d) => this.preValidate(d));
    if (isObject(data)) return mapValues(data, (value) => this.preValidate(value));
    return data;
  }

  protected validate(data: TObject): TObject & { _id?: string } {
    if (this._validator === undefined) this._validator = this._ajv.compile<T>(this.jsonSchema);

    if (!this._validator(this.preValidate(cloneDeep(data))))
      throw new ValidationError(data, this._validator.errors as ErrorObject[]);

    if (typeof this.idField === 'string') {
      return cloneDeep(omit({ _id: data[this.idField] as string, ...data }, this.idField));
    }

    return cloneDeep({
      _id: hash(pick(data, this.idField), { algorithm: 'sha1', encoding: 'hex' }),
      ...data
    });
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
