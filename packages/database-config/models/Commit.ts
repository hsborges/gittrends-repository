import Model from './Model';
import schema from '../schemas/commit.json';

export default class Commit extends Model {
  constructor() {
    super('commits', 'id', schema);
  }
}
