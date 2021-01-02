import Model from './Model';
import schema from '../schemas.json';

class GithubToken extends Model {
  tableName = 'github_tokens';
  jsonSchema = schema.definitions.IGithubToken;
}

export default new GithubToken();
