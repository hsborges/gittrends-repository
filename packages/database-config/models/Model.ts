import Knex, { Transaction } from 'knex';

type ModelID = string | string[];
type ModeJsonSchema = Record<string, unknown>;

export default abstract class Model {
  static knex: Knex;

  readonly tableName: string;
  readonly idColumn: ModelID;
  readonly jsonSchema: ModeJsonSchema;

  constructor(tableName: string, idColumn: ModelID, jsonSchema: ModeJsonSchema) {
    this.tableName = tableName;
    this.idColumn = idColumn;
    this.jsonSchema = jsonSchema;
  }

  query(transaction?: Transaction): Knex.QueryBuilder {
    const table = Model.knex(this.tableName);
    return transaction != null ? table.transacting(transaction) : table;
  }
}
