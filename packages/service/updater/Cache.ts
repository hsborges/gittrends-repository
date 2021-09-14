/*
 *  Author: Hudson S. Borges
 */
import { map } from 'bluebird';
import lru from 'redis-lru';
import hasher from 'node-object-hash';
import * as redis from '../redis';

export default class UpdaterCache {
  readonly cache: ReturnType<typeof lru>;
  readonly hashSortCoerce = hasher({ sort: true, coerce: true });

  constructor(cacheSize: number) {
    this.cache = lru(redis.cache, {
      max: cacheSize,
      namespace: 'gittrends:cache',
      maxAge: 24 * 60 * 60 * 1000
    });
  }

  async add(object: TObject | TObject[]): Promise<void> {
    await map(Array.isArray(object) ? object : [object], (object) =>
      this.cache.set(object.id ? (object.id as string) : this.hashSortCoerce.hash(object), 1)
    );
  }

  async has(object: TObject): Promise<boolean> {
    return !!(await this.cache.get((object.id as string) || this.hashSortCoerce.hash(object)));
  }
}
