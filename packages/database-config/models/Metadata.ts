import Model from './Model';
import schema from '../schemas.json';
import { IMetadata } from '../interfaces';

class Metadata extends Model<IMetadata> {
  tableName = 'metadata';
  jsonSchema = schema.definitions.IMetadata;
}

export default new Metadata();
