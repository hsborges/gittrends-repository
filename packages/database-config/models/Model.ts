import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import Knex, { Transaction } from 'knex';
import { cloneDeep, mapValues } from 'lodash';

type TObject = Record<string, unknown>;
type TRecord = Record<string, string | number | boolean>;

function preValidate(data: TObject): TObject {
  return mapValues(data, (value) => {
    if (value instanceof Date) return (value as Date).toISOString();
    if (typeof value === 'object') return preValidate(value as TObject);
    return value;
  });
}

export default abstract class Model<T> {
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

    let clone = preValidate(cloneDeep(data));

    if (!this._validator(clone))
      throw new Error(JSON.stringify({ error: this._validator.errors, data: clone }));

    clone = mapValues(clone, (value) => {
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    });

    return clone as TRecord;
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
}
