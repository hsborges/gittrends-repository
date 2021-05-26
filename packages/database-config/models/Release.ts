/*
 *  Author: Hudson S. Borges
 */
import Model from './Model';
import schema from '../schemas.json';
import IRelease from '../interfaces/IRelease';

class Release extends Model<IRelease> {
  collectionName = 'releases';
  idField = 'id';
  jsonSchema = schema.definitions.IRelease;
}

export default new Release();
