import { IsOptional, IsString } from 'class-validator';
import { MongoClient } from 'mongodb';

import { MongoRepository } from './MongoRepository';
import { Entity } from './entities';

class FakeEntity extends Entity {
  public static __collection = 'FakeEntity';

  @IsOptional()
  @IsString()
  field?: string;

  extraField?: number;
}

class FakeNonWhitelistEntity extends FakeEntity {
  public static __collection = 'FakeNonWhitelistEntity';
  public static __whitelist = false;
}

describe('Test MongoRepository function', () => {
  let connection: MongoClient;
  let entityRepository: MongoRepository<FakeEntity>;

  beforeAll(async () => {
    const connectionUrl = process.env['MONGO_URL'];
    if (!connectionUrl) throw new Error('Invalid mongodb connection url!');
    connection = await MongoClient.connect(connectionUrl);
    MongoRepository.db = connection.db();
    entityRepository = MongoRepository.from(FakeEntity);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should validate entities before inserting', async () => {
    const entity = new FakeEntity();
    const entities = [
      new FakeEntity({ _id: '1', field: 'value' }),
      new FakeEntity(),
      new FakeEntity()
    ];

    await expect(entityRepository.insert(entity)).rejects.toHaveLength(1);
    await expect(entityRepository.insert(entities)).rejects.toHaveLength(2);
  });

  it('should not persist extra fields', async () => {
    const plainData = { _id: 'extra_field', field: '1', extraField: 1 };
    const entity = new FakeEntity(plainData);
    await expect(entityRepository.insert(entity)).resolves.not.toThrow();
    const insertedEntity = entityRepository.collection.findOne({ _id: 'extra_field' });
    await expect(insertedEntity).resolves.not.toHaveProperty('extraField', plainData.extraField);
  });

  it('should persist extra fields', async () => {
    const plainData = { _id: 'extra_field', field: '1', extraField: 1 };
    const entity = new FakeNonWhitelistEntity(plainData);
    const entityExtraRepository = MongoRepository.from(FakeNonWhitelistEntity);
    await expect(entityExtraRepository.insert(entity)).resolves.not.toThrow();
    const insertedEntity = entityExtraRepository.collection.findOne({ _id: 'extra_field' });
    await expect(insertedEntity).resolves.toHaveProperty('extraField', plainData.extraField);
  });
});
