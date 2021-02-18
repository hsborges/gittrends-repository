/*
 *  Author: Hudson S. Borges
 */
import { each } from 'bluebird';
import { MD5 } from 'object-hash';
import redisLru, { LRU } from 'redis-lru';
import redis from '../redis';

export default class UpdaterCache {
  readonly cache: LRU;

  constructor(cacheSize: number) {
    this.cache = redisLru(redis, { max: cacheSize, namespace: 'cache:updater:' });
  }

  async add(object: TObject | TObject[]): Promise<void> {
    await each(Array.isArray(object) ? object : [object], (obj) =>
      this.cache.set(typeof obj.id === 'string' ? obj.id : MD5(obj), new Date())
    );
  }

  async has(object: TObject): Promise<boolean> {
    return this.cache.has(typeof object.id === 'string' ? object.id : MD5(object));
  }
}
