/*
 *  Author: Hudson S. Borges
 */
import Model from './Model';
import schema from '../schemas.json';
import IIssue from '../interfaces/IIssue';

class Issue extends Model<IIssue> {
  collectionName = 'issues';
  idField = 'id';
  jsonSchema = schema.definitions.IIssue;

  protected validate(data: any): any & { _id?: string } {
    return super.validate({ ...data, type: 'Issue' });
  }
}

export default new Issue();
