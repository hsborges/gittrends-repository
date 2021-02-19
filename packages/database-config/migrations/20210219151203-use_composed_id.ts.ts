/*
 *  Author: Hudson S. Borges
 */
import hash from 'object-hash';
import { isArray, isPlainObject, mapValues, omit, pick } from 'lodash';
import { Db } from 'mongodb';
import { Dependency, Model, Stargazer, Watcher } from '../models';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/i;

function castDates(object: any): any {
  if (isArray(object)) return object.map(castDates);
  if (isPlainObject(object)) return mapValues(object, castDates);
  if (typeof object === 'string' && DATE_REGEX.test(object)) return new Date(object);
  return object;
}

export = {
  async up(db: Db): Promise<void> {
    const migrate = async (model: Model<any>) => {
      const tmpName = `new_${model.collectionName}`;
      const collection = await db.createCollection(tmpName);
      const cursor = db.collection(model.collectionName).find({});
      while (await cursor.hasNext()) {
        const record = castDates(await cursor.next());
        await collection
          .insertOne({ _id: pick(record, model.idField), ...omit(record, model.idField) })
          .catch((err) => {
            if (err.code === 11000) return;
            throw err;
          });
      }
      await db.renameCollection(tmpName, model.collectionName, { dropTarget: true });
    };

    await Promise.all([migrate(Dependency), migrate(Stargazer), migrate(Watcher)]);

    await Promise.all([
      db
        .collection('stargazers')
        .createIndex([{ key: { '_id.repository': 1 }, name: 'stargazers_repository_index' }]),
      db
        .collection('watchers')
        .createIndex([{ key: { '_id.repository': 1 }, name: 'watchers_repository_index' }]),
      db
        .collection('dependencies')
        .createIndex([{ key: { '_id.repository': 1 }, name: 'dependencies_repository_index' }])
    ]);
  },

  async down(db: Db): Promise<void> {
    const migrate = async (model: Model<any>) => {
      const tmpName = `old_${model.collectionName}`;
      const collection = await db.createCollection(tmpName);
      const cursor = db.collection(model.collectionName).find({});
      while (await cursor.hasNext()) {
        const record = await cursor.next();
        await collection
          .insertOne({
            ...omit(record, '_id'),
            ...record._id,
            _id: hash(record._id, { algorithm: 'sha1', encoding: 'hex' })
          })
          .catch((err) => {
            if (err.code === 11000) return;
            throw err;
          });
      }
      await db.renameCollection(tmpName, model.collectionName, { dropTarget: true });
    };

    await Promise.all([migrate(Dependency), migrate(Stargazer), migrate(Watcher)]);

    await Promise.all([
      db
        .collection('stargazers')
        .createIndex([{ key: { repository: 1 }, name: 'stargazers_repository_index' }]),
      db
        .collection('watchers')
        .createIndex([{ key: { repository: 1 }, name: 'watchers_repository_index' }]),
      db
        .collection('dependencies')
        .createIndex([{ key: { repository: 1 }, name: 'dependencies_repository_index' }])
    ]);
  }
};
