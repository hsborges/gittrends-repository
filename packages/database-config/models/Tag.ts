import Model from './Model';
import schema from '../schemas/tag.json';

export default class Tag extends Model {
  constructor() {
    super('tags', 'id', schema);
  }
}
