import Model from './Model';
import schema from '../schemas/stargazer.json';

export default class Stargazer extends Model {
  constructor() {
    super('stargazers', ['repository', 'user', 'starred_at'], schema);
  }
}
