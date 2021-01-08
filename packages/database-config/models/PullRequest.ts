import Model from './Model';
import schema from '../schemas.json';
import Knex, { Transaction } from 'knex';
import IPullRequest from '../interfaces/IPullRequest';

class PullRequest extends Model<IPullRequest> {
  tableName = 'issues';
  idColumn = 'id';
  jsonSchema = schema.definitions.IPullRequest;

  validate(data: Record<string, unknown>): Record<string, string | number | boolean> {
    if (!data.type) data.type = 'PullRequest';
    if (data.reaction_groups) data.reaction_groups = JSON.stringify(data.reaction_groups);
    return super.validate(data);
  }

  query(transaction?: Transaction): Knex.QueryBuilder {
    return super.query(transaction).where(`${this.tableName}.type`, '=', 'PullRequest');
  }
}

export default new PullRequest();
