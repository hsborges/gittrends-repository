import Model from './Model';
import schema from '../schemas.json';
import IStargazer from '../interfaces/IStargazer';

class Stargazer extends Model<IStargazer> {
  tableName = 'stargazers';
  idColumn = ['repository', 'user', 'starred_at'];
  jsonSchema = schema.definitions.IStargazer;
}

export default new Stargazer();
