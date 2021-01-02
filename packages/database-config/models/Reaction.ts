import Model from './Model';
import schema from '../schemas.json';

class Reaction extends Model {
  tableName = 'reactions';
  jsonSchema = schema.definitions.IReaction;
}

export default new Reaction();
