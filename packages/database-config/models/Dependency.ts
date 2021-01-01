import Model from './Model';
import schema from '../schemas/dependency.json';

export default class Dependency extends Model {
  constructor() {
    super('dependencies', ['repository', 'manifest', 'package_name'], schema);
  }
}
