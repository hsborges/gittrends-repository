import Model from './Model';
import schema from '../schemas.json';

class Repository extends Model {
  tableName = 'repositories';
  jsonSchema = schema.definitions.IRepository;
}

export default new Repository();
