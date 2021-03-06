/*
 *  Author: Hudson S. Borges
 */
import Model from './Model';
import schema from '../schemas.json';
import IReaction from '../interfaces/IReaction';

class Reaction extends Model<IReaction> {
  collectionName = 'reactions';
  idField = 'id';
  jsonSchema = schema.definitions.IReaction;
}

export default new Reaction();
