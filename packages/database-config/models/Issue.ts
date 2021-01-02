import Model from './Model';
import schema from '../schemas.json';
import Knex, { Transaction } from 'knex';

class Issue extends Model {
  tableName = 'issues';
  jsonSchema = schema.definitions.IIssue;

  query(transaction?: Transaction): Knex.QueryBuilder {
    return super.query(transaction).where(`${this.tableName}.type`, '=', 'Issue');
  }
}

export default new Issue();
