import Model from './Model';
import schema from '../schemas.json';
import Knex, { Transaction } from 'knex';
import IPullRequest from '../interfaces/IPullRequest';

class PullRequest extends Model<IPullRequest> {
  tableName = 'issues';
  idColumn = 'id';
  jsonSchema = schema.definitions.IPullRequest;

  query(transaction?: Transaction): Knex.QueryBuilder {
    return super.query(transaction).where(`${this.tableName}.type`, '=', 'PullRequest');
  }
}

export default new PullRequest();
