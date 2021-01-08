import Model from './Model';
import schema from '../schemas.json';
import ICommit from '../interfaces/ICommit';

class Commit extends Model<ICommit> {
  tableName = 'commits';
  idColumn = 'id';
  jsonSchema = schema.definitions.ICommit;
}

export default new Commit();
