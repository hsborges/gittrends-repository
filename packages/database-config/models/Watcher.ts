import Model from './Model';
import schema from '../schemas.json';

class Watcher extends Model {
  tableName = 'watchers';
  jsonSchema = schema.definitions.IWatcher;
}

export default new Watcher();
