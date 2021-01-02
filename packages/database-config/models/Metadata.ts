import Model from './Model';
import schema from '../schemas.json';

class Metadata extends Model {
  tableName = 'metadata';
  jsonSchema = schema.definitions.IMetadata;
}

export default new Metadata();
