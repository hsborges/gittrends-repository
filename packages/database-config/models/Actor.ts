/*
 *  Author: Hudson S. Borges
 */
import Model from './Model';
import schema from '../schemas.json';
import IActor from '../interfaces/IActor';

class Actor extends Model<IActor> {
  collectionName = 'actors';
  idField = 'id';
  jsonSchema = schema.definitions.IActor;
}

export default new Actor();
