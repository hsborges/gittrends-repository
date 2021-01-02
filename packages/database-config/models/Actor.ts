import Model from './Model';
import schema from '../schemas.json';

class Actor extends Model {
  tableName = 'actors';
  jsonSchema = schema.definitions.IActor;
}

export default new Actor();
