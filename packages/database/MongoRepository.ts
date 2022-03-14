/*
 *  Author: Hudson S. Borges
 */
import urlParser from 'mongo-url-parser';
import { Collection, Db, Document } from 'mongodb';
import { MongoClient } from 'mongodb';

import { Entity } from './entities/Entity';
import { CONNECTION_URL, POOL_SIZE } from './util/mongo-config';

export class MongoRepository<T extends Entity> {
  private static conn?: MongoClient;
  private static db?: Db;

  private constructor(private EntityRef: new (...args: any[]) => T) {}

  public static async connect(url?: string, opts?: { poolSize: number }): Promise<MongoClient> {
    if (this.conn) return this.conn;

    this.conn = await MongoClient.connect(url || CONNECTION_URL, {
      maxPoolSize: opts?.poolSize || POOL_SIZE
    });

    const { dbName } = urlParser(url || CONNECTION_URL);
    this.db = this.conn.db(dbName);
    const originalDb = this.conn.db.bind(this.conn);
    this.conn.db = (providedName, options) => originalDb(providedName || dbName, options);

    return this.conn;
  }

  public static async close(): Promise<void> {
    this.db = undefined;
    return this.conn?.close();
  }

  public get collection(): Collection<Document> {
    if (!MongoRepository.db) throw new Error('Not connected to a MongoDB instance!');
    return MongoRepository.db?.collection((this.EntityRef as any).__collection);
  }

  private validateAndTransform(object: T | T[]): T[] {
    return (Array.isArray(object) ? object : [object]).map((record) =>
      new (record.constructor as any)(record).toJSON()
    );
  }

  public async insert(object: T | T[]): Promise<void> {
    if (Array.isArray(object) && object.length === 0) return;

    await this.collection
      .bulkWrite(
        this.validateAndTransform(object).map((record) => ({ insertOne: { document: record } })),
        { ordered: false }
      )
      .catch((err) => {
        if (err.code && err.code === 11000) return;
        else throw err;
      });
  }

  public async upsert(object: T | T[]): Promise<void> {
    if (Array.isArray(object) && object.length === 0) return;

    await this.collection.bulkWrite(
      this.validateAndTransform(object).map((record) => ({
        replaceOne: { filter: { _id: record._id }, replacement: record, upsert: true }
      })),
      { ordered: false }
    );
  }

  public static get<T extends Entity>(entityRef: new (...args: any[]) => T): MongoRepository<T> {
    return new MongoRepository(entityRef);
  }
}
