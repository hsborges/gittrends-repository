import Model from './Model';
import schema from '../schemas.json';

class Tag extends Model {
  tableName = 'tags';
  jsonSchema = schema.definitions.ITag;
}

export default new Tag();
