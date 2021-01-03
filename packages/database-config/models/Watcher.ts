import Model from './Model';
import schema from '../schemas.json';
import { IWatcher } from '../interfaces/IWatcher';

class Watcher extends Model<IWatcher> {
  tableName = 'watchers';
  jsonSchema = schema.definitions.IWatcher;
}

export default new Watcher();
