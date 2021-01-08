import Model from './Model';
import schema from '../schemas.json';
import IMetadata from '../interfaces/IMetadata';

class Metadata extends Model<IMetadata> {
  tableName = 'metadata';
  idColumn = ['id', 'resource', 'key'];
  jsonSchema = schema.definitions.IMetadata;
}

export default new Metadata();
