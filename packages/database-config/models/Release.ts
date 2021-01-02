import Model from './Model';
import schema from '../schemas.json';

class Release extends Model {
  tableName = 'releases';
  jsonSchema = schema.definitions.IRelease;
}

export default new Release();
