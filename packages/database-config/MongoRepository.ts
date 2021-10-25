/*
 *  Author: Hudson S. Borges
 */
import { ClassConstructor } from 'class-transformer';
import { ValidationError } from 'class-validator';
import 'es6-shim';
import { Collection, Db, Document } from 'mongodb';
import 'reflect-metadata';

import { Entity, validate, entityToPlain } from './entities';

export class MongoRepository<T extends Entity> {
  public static db: Db;

  public readonly collection: Collection<Document>;

  private constructor(entityRef: ClassConstructor<T>) {
    this.collection = MongoRepository.db?.collection((entityRef as any).__collection);
  }

  private validateAndTransform(object: T | T[]): Record<string, unknown>[] {
    const records = Array.isArray(object) ? object : [object];

    const errors = records.reduce(
      (memo: ValidationError[], record) => memo.concat(validate(record)),
      []
    );

    if (errors.length) throw errors;
    else return records.map(entityToPlain);
  }

  public async insert(object: T | T[]): Promise<void> {
    const records = this.validateAndTransform(object);

    await this.collection
      .bulkWrite(
        records.map((record) => ({ insertOne: { document: record } })),
        { ordered: false }
      )
      .catch((err) => {
        if (err.code && err.code === 11000) return;
        else throw err;
      });
  }

  public async upsert(object: T | T[]): Promise<void> {
    const records = this.validateAndTransform(object);

    await this.collection.bulkWrite(
      records.map((record) => ({
        replaceOne: { filter: { _id: record._id }, replacement: record, upsert: true }
      })),
      { ordered: false }
    );
  }

  public static from<T extends Entity>(entityRef: ClassConstructor<T>): MongoRepository<T> {
    return new MongoRepository(entityRef);
  }
}
