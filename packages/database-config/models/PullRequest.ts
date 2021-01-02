import Model from './Model';
import schema from '../schemas.json';
import Knex, { Transaction } from 'knex';

class PullRequest extends Model {
  tableName = 'issues';
  jsonSchema = schema.definitions.IPullRequest;

  query(transaction?: Transaction): Knex.QueryBuilder {
    return super.query(transaction).where(`${this.tableName}.type`, '=', 'PullRequest');
  }
}

export default new PullRequest();
