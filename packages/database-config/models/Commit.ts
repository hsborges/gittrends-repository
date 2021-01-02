import Model from './Model';
import schema from '../schemas.json';

class Commit extends Model {
  tableName = 'commits';
  jsonSchema = schema.definitions.ICommit;
}

export default new Commit();
