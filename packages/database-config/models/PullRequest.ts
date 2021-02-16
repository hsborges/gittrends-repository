/*
 *  Author: Hudson S. Borges
 */
import Model from './Model';
import schema from '../schemas.json';
import IPullRequest from '../interfaces/IPullRequest';

class PullRequest extends Model<IPullRequest> {
  collectionName = 'issues';
  idField = 'id';
  jsonSchema = schema.definitions.IPullRequest;

  protected validate(data: TObject): TObject & { _id?: string } {
    return super.validate({ ...data, type: 'PullRequest' });
  }
}

export default new PullRequest();
