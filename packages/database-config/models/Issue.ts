import Model from './Model';
import schema from '../schemas/issue.json';
import Knex, { Transaction } from 'knex';

export default class Issue extends Model {
  readonly issueType: string = 'Issue';

  constructor(additionalProperties?: Record<string, unknown>) {
    super('issues', 'id', {
      ...schema,
      properties: { ...schema.properties, ...additionalProperties }
    });
  }

  query(transaction?: Transaction): Knex.QueryBuilder {
    return super.query(transaction).where('issues.type', this.issueType);
  }
}
