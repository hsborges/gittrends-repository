import Model from './Model';
import schema from '../schemas.json';
import { IRelease } from '../interfaces/IRelease';

class Release extends Model<IRelease> {
  tableName = 'releases';
  idColumn = 'id';
  jsonSchema = schema.definitions.IRelease;
}

export default new Release();
