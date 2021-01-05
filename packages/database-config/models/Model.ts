import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import Knex, { Transaction } from 'knex';
import { cloneDeep, mapValues, pick, isArray, isObject } from 'lodash';

type TObject = Record<string, unknown>;
type TRecord = Record<string, string | number | boolean>;

function preValidate(data: unknown): unknown {
  if (data instanceof Date) return data.toISOString();
  if (isArray(data)) return data.map((d) => preValidate(d));
  if (isObject(data)) return mapValues(data, (value) => preValidate(value));
  return data;
}

function postValidate(data: TObject): TRecord {
  return mapValues(data, (value) => {
    if (typeof value === 'string') return value.replace(/\u0000/g, '');
    if (typeof value === 'object') return JSON.stringify(value).replace(/\u0000/g, '');
    return value;
  }) as TRecord;
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

  query(transaction?: Transaction): Knex.QueryBuilder {
    const table = Model.knex<T>(this.tableName);
    return transaction != null ? table.transacting(transaction) : table;
  }

  validate(data: Record<string, unknown>): TRecord {
    if (this._validator === undefined) this._validator = this._ajv.compile<T>(this.jsonSchema);

    const clone = preValidate(cloneDeep(data)) as Record<string, unknown>;
    if (!this._validator(clone))
      throw new ValidationError(clone, this._validator.errors as ErrorObject[]);

    return postValidate(clone);
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
