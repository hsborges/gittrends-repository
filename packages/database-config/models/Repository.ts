/*
 *  Author: Hudson S. Borges
 */
import Model from './Model';
import schema from '../schemas.json';
import IRepository from '../interfaces/IRepository';

class Repository extends Model<IRepository> {
  collectionName = 'repositories';
  idField = 'id';
  jsonSchema = schema.definitions.IRepository;
}

export default new Repository();
