import { Transaction } from 'knex';

import Model from './Model';
import schema from '../schemas.json';
import IMetadata from '../interfaces/IMetadata';

class Metadata extends Model<IMetadata> {
  tableName = 'metadata';
  idColumn = ['id', 'resource', 'key'];
  jsonSchema = schema.definitions.IMetadata;

  async find(
    id: string,
    resource: string,
    key: string,
    transaction?: Transaction
  ): Promise<IMetadata | undefined> {
    return this.query(transaction).where({ id, resource, key }).first();
  }
}

export default new Metadata();
