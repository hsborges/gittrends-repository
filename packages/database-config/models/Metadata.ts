import { get, merge } from 'lodash';
import { Transaction } from 'knex';

import Model from './Model';
import schema from '../schemas.json';
import IMetadata from '../interfaces/IMetadata';

class Metadata extends Model<IMetadata> {
  tableName = 'metadata';
  idColumn = 'id';
  jsonSchema = schema.definitions.IMetadata;

  async insert(): Promise<void> {
    throw new Error('Method not allowed for Metadata!');
  }

  async update(): Promise<void> {
    throw new Error('Method not allowed for Metadata!');
  }

  async upsert(record: IMetadata | IMetadata[], transaction?: Transaction): Promise<void> {
    const records = (Array.isArray(record) ? record : [record]).map((data) => this.validate(data));

    await Promise.all(
      records.map(async (record) => {
        const current = await this.query(transaction).where({ id: record.id }).first();
        const update = record.resource
          ? { [record.resource as string]: { [record.key as string]: [record.value] } }
          : { [record.key as string]: [record.value] };

        this.query(transaction)
          .insert(merge({ id: record.id, ...(current || {}), data: update }))
          .onConflict('id')
          .merge();
      })
    );
  }

  async find(
    id: string,
    resource: string | null | undefined,
    key: string,
    transaction?: Transaction
  ): Promise<IMetadata | undefined> {
    const metadata = await this.query(transaction).where({ id });
    const value = get(metadata, resource ? [resource, key] : [key], null);
    if (value) return { id, resource: resource || undefined, key, value };
    return undefined;
  }
}

export default new Metadata();
