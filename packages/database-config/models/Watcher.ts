import Model from './Model';
import schema from '../schemas.json';
import IWatcher from '../interfaces/IWatcher';

class Watcher extends Model<IWatcher> {
  collectionName = 'watchers';
  idField = ['repository', 'user'];
  jsonSchema = schema.definitions.IWatcher;
}

export default new Watcher();
