import Model from './Model';
import schema from '../schemas/actor.json';

export default class Actor extends Model {
  constructor() {
    super('actors', 'id', schema);
  }
}
