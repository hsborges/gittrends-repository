import Model from './Model';
import schema from '../schemas/watcher.json';

export default class Watcher extends Model {
  constructor() {
    super('watchers', ['repository', 'user'], schema);
  }
}
