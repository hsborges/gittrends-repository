import Model from './Model';
import schema from '../schemas.json';
import Knex, { Transaction } from 'knex';
import IIssue from '../interfaces/IIssue';

class Issue extends Model<IIssue> {
  tableName = 'issues';
  idColumn = 'id';
  jsonSchema = schema.definitions.IIssue;

  protected postValidate(data: TObject): Record<string, string | number | boolean> {
    if (data.reaction_groups) data.reaction_groups = JSON.parse(data.reaction_groups as string);
    return super.postValidate(data);
  }

  protected validate(data: Record<string, unknown>): Record<string, string | number | boolean> {
    if (!data.type) data.type = 'Issue';
    if (data.reaction_groups) data.reaction_groups = JSON.stringify(data.reaction_groups);
    return super.validate(data);
  }

  query(transaction?: Transaction): Knex.QueryBuilder {
    return super.query(transaction).where(`${this.tableName}.type`, '=', 'Issue');
  }
}

export default new Issue();
