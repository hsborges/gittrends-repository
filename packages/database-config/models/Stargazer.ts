/*
 *  Author: Hudson S. Borges
 */
import Model from './Model';
import schema from '../schemas.json';
import IStargazer from '../interfaces/IStargazer';

class Stargazer extends Model<IStargazer> {
  collectionName = 'stargazers';
  idField = ['repository', 'user', 'starred_at'];
  jsonSchema = schema.definitions.IStargazer;
}

export default new Stargazer();
