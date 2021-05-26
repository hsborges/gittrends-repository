/*
 *  Author: Hudson S. Borges
 */
import Model from './Model';
import schema from '../schemas.json';
import ITag from '../interfaces/ITag';

class Tag extends Model<ITag> {
  collectionName = 'tags';
  idField = 'id';
  jsonSchema = schema.definitions.ITag;
}

export default new Tag();
