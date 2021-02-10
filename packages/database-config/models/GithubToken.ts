import Model from './Model';
import schema from '../schemas.json';
import IGithubToken from '../interfaces/IGithubToken';

class GithubToken extends Model<IGithubToken> {
  collectionName = 'github_tokens';
  idField = 'id';
  jsonSchema = schema.definitions.IGithubToken;
}

export default new GithubToken();
