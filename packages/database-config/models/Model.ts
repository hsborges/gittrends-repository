import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import Knex, { Transaction } from 'knex';
import { cloneDeep, mapValues } from 'lodash';

export default abstract class Model<T> {
  static knex: Knex;

  abstract get tableName(): string;
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

  get idColumn(): string | string[] {
    return 'id';
  }

  query(transaction?: Transaction): Knex.QueryBuilder {
    const table = Model.knex(this.tableName);
    return transaction != null ? table.transacting(transaction) : table;
  }

  validate(data: Record<string, unknown>): Record<string, string | number | boolean> {
    if (this._validator === undefined) this._validator = this._ajv.compile<T>(this.jsonSchema);

    let clone = mapValues(cloneDeep(data), (value) => {
      if (value instanceof Date) return (value as Date).toISOString();
      return value;
    });

    if (!this._validator(clone)) throw new Error(JSON.stringify(this._validator.errors));

    clone = mapValues(clone, (value) => {
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    });

    return clone as Record<string, string | number | boolean>;
  }
}
