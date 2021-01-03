import Model from './Model';
import schema from '../schemas.json';
import { IStargazer } from '../interfaces';

class Stargazer extends Model<IStargazer> {
  tableName = 'stargazers';
  jsonSchema = schema.definitions.IStargazer;
}

export default new Stargazer();
