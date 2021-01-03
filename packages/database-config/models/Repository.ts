import Model from './Model';
import schema from '../schemas.json';
import { IRepository } from '../interfaces';

class Repository extends Model<IRepository> {
  tableName = 'repositories';
  jsonSchema = schema.definitions.IRepository;
}

export default new Repository();
