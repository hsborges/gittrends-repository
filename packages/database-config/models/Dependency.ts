import Model from './Model';
import schema from '../schemas.json';

class Dependency extends Model {
  tableName = 'dependencies';
  jsonSchema = schema.definitions.IDependency;
}

export default new Dependency();
