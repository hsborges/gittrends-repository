import Model from './Model';
import schema from '../schemas.json';
import Knex, { Transaction } from 'knex';
import { IIssue } from '../interfaces/IIssue';

class Issue extends Model<IIssue> {
  tableName = 'issues';
  idColumn = 'id';
  jsonSchema = schema.definitions.IIssue;

  query(transaction?: Transaction): Knex.QueryBuilder {
    return super.query(transaction).where(`${this.tableName}.type`, '=', 'Issue');
  }
}

export default new Issue();
