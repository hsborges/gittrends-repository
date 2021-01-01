import Model from './Model';
import schema from '../schemas/release.json';

export default class Release extends Model {
  constructor() {
    super('releases', 'id', schema);
  }
}
