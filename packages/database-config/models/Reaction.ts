import Model from './Model';
import schema from '../schemas/reaction.json';

export default class Reaction extends Model {
  constructor() {
    super('reactions', 'id', schema);
  }
}
