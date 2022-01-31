/*
 *  Author: Hudson S. Borges
 */
import { ClassConstructor } from 'class-transformer';
import 'es6-shim';
import { Collection, Db, Document } from 'mongodb';
import 'reflect-metadata';

import { Entity } from './entities';

export class MongoRepository<T extends Entity> {
  private static repositories: Record<string, MongoRepository<any>> = {};
  public static db: Db;

  private entityRef!: ClassConstructor<T>;

  public get collection(): Collection<Document> {
    return MongoRepository.db?.collection((this.entityRef as any).__collection);
  }

  private constructor(entityRef: ClassConstructor<T>) {
    this.entityRef = entityRef;
  }

  private validateAndTransform(object: T | T[]): Record<string, unknown>[] {
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
        updateOne: { filter: { _id: record._id }, update: record, upsert: true }
      })),
      { ordered: false }
    );
  }

  public static get<T extends Entity>(entityRef: ClassConstructor<T>): MongoRepository<T> {
    if (!(entityRef.name in MongoRepository.repositories))
      MongoRepository.repositories[entityRef.name] = new MongoRepository(entityRef);

    return MongoRepository.repositories[entityRef.name];
  }
}
