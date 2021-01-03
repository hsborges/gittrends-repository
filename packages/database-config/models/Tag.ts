import Model from './Model';
import schema from '../schemas.json';
import { ITag } from '../interfaces/ITag';

class Tag extends Model<ITag> {
  tableName = 'tags';
  jsonSchema = schema.definitions.ITag;
}

export default new Tag();
