import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import Knex, { Transaction } from 'knex';
import dayjs from 'dayjs';
import utf8 from 'utf8';
import customParserForamt from 'dayjs/plugin/customParseFormat';
import { cloneDeep, mapValues, pick, isArray, isObject } from 'lodash';

type TObject = Record<string, unknown>;
type TRecord = Record<string, string | number | boolean>;

dayjs.extend(customParserForamt);
const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

function recursiveEncode(data: unknown): unknown {
  if (Array.isArray(data)) return data.map(recursiveEncode);
  if (typeof data === 'object') return mapValues(data, recursiveEncode);
  if (typeof data === 'string') return utf8.encode(data).replace(/\u0000/g, '');
  return data;
}

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
  static knex: Knex;

  abstract get tableName(): string;
  abstract get idColumn(): string | string[];
  abstract get jsonSchema(): Record<string, unknown>;

  private readonly _ajv: Ajv = new Ajv({
    allErrors: true,
    coerceTypes: true,
    useDefaults: true,
    removeAdditional: 'all'
  });

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

  protected postValidate(data: TObject): TRecord {
    return mapValues(recursiveEncode(data) as TObject, (value) => {
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    }) as TRecord;
  }

  protected validate(data: Record<string, unknown>): TRecord {
    if (this._validator === undefined) this._validator = this._ajv.compile<T>(this.jsonSchema);

    const clone = this.preValidate(cloneDeep(data)) as Record<string, unknown>;
    if (!this._validator(clone))
      throw new ValidationError(clone, this._validator.errors as ErrorObject[]);

    return this.postValidate(clone);
  }

  query(transaction?: Transaction): Knex.QueryBuilder {
    const table = Model.knex<T>(this.tableName);
    return transaction != null ? table.transacting(transaction) : table;
  }

  async insert(record: TObject | TObject[], transaction?: Transaction): Promise<void> {
    const records = (Array.isArray(record) ? record : [record]).map((data) => this.validate(data));

    await this.query(transaction)
      .insert(records)
      .onConflict(typeof this.idColumn === 'string' ? [this.idColumn] : this.idColumn)
      .ignore();
  }

  async upsert(record: TObject | TObject[], transaction?: Transaction): Promise<void> {
    const records = (Array.isArray(record) ? record : [record]).map((data) => this.validate(data));

    await this.query(transaction)
      .insert(records)
      .onConflict(typeof this.idColumn === 'string' ? [this.idColumn] : this.idColumn)
      .merge();
  }

  async update(record: TObject | TObject[], transaction?: Transaction): Promise<void> {
    const records = (Array.isArray(record) ? record : [record]).map((data) => this.validate(data));

    await Promise.all(
      records.map((record) =>
        this.query(transaction).where(pick(record, this.idColumn)).update(record)
      )
    );
  }
}
