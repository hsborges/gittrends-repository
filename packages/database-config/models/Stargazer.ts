import Model from './Model';
import schema from '../schemas.json';

class Stargazer extends Model {
  tableName = 'stargazers';
  jsonSchema = schema.definitions.IStargazer;
}

export default new Stargazer();
