/*
 *  Author: Hudson S. Borges
 */
import { map } from 'bluebird';
import hasher from 'node-object-hash';
import lru from 'redis-lru';

import { Entity } from '@gittrends/database-config';

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

  async add(object: Entity | Entity[]): Promise<void> {
    await map(Array.isArray(object) ? object : [object], (object) =>
      this.cache.set(object._id ? object._id : this.hashSortCoerce.hash(object.toJSON()), 1)
    );
  }

  async has(object: Entity): Promise<boolean> {
    return !!(await this.cache.get(object._id || this.hashSortCoerce.hash(object.toJSON())));
  }
}
