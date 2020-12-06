class Model {
  static knex(knex) {
    this.knex = knex;
  }

  static get tableName() {
    throw new Error('Model.tableName is required!');
  }

  static get idColumn() {
    throw new Error('Model.idColumn is required!');
  }

  static get jsonSchema() {
    throw new Error('Model.jsonSchema is required!');
  }

  static query(transaction) {
    const table = this.knex(this.tableName);
    return transaction ? table.transacting(transaction) : table;
  }
}

module.exports = Model;
