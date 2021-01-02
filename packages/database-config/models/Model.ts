import Ajv from 'ajv';
import Knex, { Transaction } from 'knex';

export default abstract class Model {
  static knex: Knex;

  abstract get tableName(): string;
  abstract get jsonSchema(): Record<string, unknown>;

  private readonly _ajv: Ajv.Ajv = new Ajv({
    allErrors: true,
    removeAdditional: true,
    coerceTypes: true,
    useDefaults: true
  });

  private _validator: Ajv.ValidateFunction | undefined;

  get idColumn(): string | string[] {
    return 'id';
  }

  query(transaction?: Transaction): Knex.QueryBuilder {
    const table = Model.knex(this.tableName);
    return transaction != null ? table.transacting(transaction) : table;
  }

  validate(data: Record<string, unknown>): boolean {
    if (this._validator === undefined) this._validator = this._ajv.compile(this.jsonSchema);
    return !!this._validator(data);
  }
}
