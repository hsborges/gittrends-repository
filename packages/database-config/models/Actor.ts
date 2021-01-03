import Model from './Model';
import schema from '../schemas.json';
import { IActor } from '../interfaces/IActor';

class Actor extends Model<IActor> {
  tableName = 'actors';
  jsonSchema = schema.definitions.IActor;
}

export default new Actor();
