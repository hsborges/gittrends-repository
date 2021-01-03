import Model from './Model';
import schema from '../schemas.json';
import { IDependency } from '../interfaces/IDependency';

class Dependency extends Model<IDependency> {
  tableName = 'dependencies';
  jsonSchema = schema.definitions.IDependency;
}

export default new Dependency();
