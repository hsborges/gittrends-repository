import Model from './Model';
import schema from '../schemas/metadata.json';

export default class Reaction extends Model {
  constructor() {
    super('metadata', ['id', 'resource', 'key'], schema);
  }
}
