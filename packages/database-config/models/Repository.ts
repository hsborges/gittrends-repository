import Model from './Model';
import schema from '../schemas/repository.json';

export default class Repository extends Model {
  constructor() {
    super('repositories', 'id', schema);
  }
}

module.exports = Repository;
