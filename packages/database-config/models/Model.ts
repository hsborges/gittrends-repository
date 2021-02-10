import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { ClientSession, Collection, Cursor, Db } from 'mongodb';
import { cloneDeep, pick, omit, isArray, mapValues, isObject } from 'lodash';
import hash from 'object-hash';
import dayjs from 'dayjs';
import customParserForamt from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParserForamt);

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

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

  private readonly _ajv: Ajv = new Ajv({ allErrors: true, coerceTypes: true });

  private _validator: ValidateFunction<T> | undefined;

  constructor() {
    addFormats(this._ajv);
  }

  protected preValidate(data: unknown): unknown {
    if (data instanceof Date) return dayjs(data).format(DATE_FORMAT);
    if (isArray(data)) return data.map((d) => this.preValidate(d));
    if (isObject(data)) return mapValues(data, (value) => this.preValidate(value));
    return data;
  }

  protected postValidate(data: TObject): TObject {
    return mapValues(data, (value) => {
      if (typeof value === 'string') {
        const d = dayjs(value, DATE_FORMAT);
        if (d.isValid()) return d.toDate();
        else return value;
      }
      return value;
    });
  }

  protected validate(data: TObject): TObject & { _id?: string } {
    if (this._validator === undefined) this._validator = this._ajv.compile<T>(this.jsonSchema);

    const clone = this.preValidate(cloneDeep(data)) as TObject;
    if (!this._validator(clone))
      throw new ValidationError(clone, this._validator.errors as ErrorObject[]);

    if (typeof this.idField === 'string') {
      return this.postValidate(
        omit({ _id: clone[this.idField] as string, ...clone }, this.idField)
      );
    }

    return this.postValidate({ _id: hash(pick(clone, this.idField)), ...clone });
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

    await this.collection.bulkWrite(
      records.map((record) => ({ insertOne: { document: record } })),
      { session, ordered: false }
    );
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
