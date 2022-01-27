import mongoClient, { Actor, Entity, MongoRepository, Repository } from '@gittrends/database';

import { Cache } from './Cache';
import { EntityStorage } from './EntityStorage';

jest.mock('mongodb', () => {
  const originalModule = jest.requireActual('mongodb');

  class MongoClient extends originalModule.MongoClient {
    constructor(...args: any[]) {
      super(
        `${(global as any).__MONGO_URI__ + (global as any).__MONGO_DB_NAME__}`,
        ...args.slice(1)
      );
    }
  }

  return {
    ...originalModule,
    MongoClient
  };
});

let storage: EntityStorage<Entity>;

const samples = {
  actor: new Actor({ id: '1234567890', type: 'User', login: 'hsborges' }),
  repo: new Repository({
    id: '_1234567890',
    owner: '1234567890',
    name: 'repo',
    name_with_owner: 'hsborges/repo'
  })
};

beforeAll(async () => {
  await mongoClient.connect();
});

afterAll(async () => {
  await mongoClient.close();
});

beforeEach(async () => {
  storage = new EntityStorage();
  await MongoRepository.get(Actor).collection.deleteMany({});
  await MongoRepository.get(Repository).collection.deleteMany({});
});

test('it should add entities', () => {
  storage.add(samples.actor);
  storage.add(samples.repo);
});

test('it should return the number of stored entities', () => {
  expect(storage.size()).toBe(0);

  storage.add(samples.actor);
  expect(storage.size()).toBe(1);
  expect(storage.size(Actor)).toBe(1);
  expect(storage.size(Repository)).toBe(0);

  storage.add(samples.actor);
  expect(storage.size()).toBe(2);
  expect(storage.size(Actor)).toBe(2);

  storage.add(samples.repo);
  expect(storage.size()).toBe(3);
  expect(storage.size(Actor)).toBe(2);
  expect(storage.size(Repository)).toBe(1);
});

test('it should remove entities from storage', () => {
  expect(storage.size()).toBe(0);

  storage.add(samples.actor);
  storage.add(samples.actor);
  storage.add(samples.repo);
  expect(storage.size()).toBe(3);

  storage.clean(Actor);
  expect(storage.size()).toBe(1);

  storage.add(samples.actor);
  storage.clean();
  expect(storage.size()).toBe(0);
});

test('it should persist stored entities to database', async () => {
  storage.add(samples.actor);
  storage.add(samples.repo);

  await storage.persist();

  const dbRepos = await MongoRepository.get(Repository).collection.find().toArray();
  const dbActors = await MongoRepository.get(Actor).collection.find().toArray();

  expect(dbRepos).toHaveLength(1);
  expect(dbRepos).toEqual([samples.repo]);
  expect(dbActors).toHaveLength(1);
  expect(dbActors).toEqual([samples.actor]);

  expect(storage.size()).toBe(0);
});

test('it should persist stored entities from a specified entity', async () => {
  storage.add(samples.actor);
  storage.add(samples.repo);

  await storage.persist(Actor);

  const dbRepos = await MongoRepository.get(Repository).collection.find().toArray();
  const dbActors = await MongoRepository.get(Actor).collection.find().toArray();

  expect(dbRepos).toHaveLength(0);
  expect(dbActors).toHaveLength(1);
  expect(dbActors).toEqual([samples.actor]);

  expect(storage.size()).toBe(1);
});

test('it should use cache when enabled', async () => {
  const cache = new Cache(100);

  storage = new EntityStorage(cache);

  const cacheHasSpy = jest.spyOn(cache, 'has');
  const cacheAddSpy = jest.spyOn(cache, 'add');

  storage.add(samples.actor);
  await storage.persist();

  expect(cacheHasSpy).toHaveBeenCalledTimes(1);
  expect(cacheAddSpy).toHaveBeenCalledTimes(1);

  storage.add(samples.actor);
  await storage.persist();

  expect(cacheHasSpy).toHaveBeenCalledTimes(2);
  expect(cacheAddSpy).toHaveBeenCalledTimes(1);

  storage.add([samples.actor, samples.repo]);
  await storage.persist();

  expect(cacheHasSpy).toHaveBeenCalledTimes(3);
  expect(cacheAddSpy).toHaveBeenCalledTimes(2);
});
