/*
 *  Author: Hudson S. Borges
 */
import LRU from 'lru-cache';
import { MD5 } from 'object-hash';

export default class UpdaterCache {
  readonly cache: LRU<string, Date>;

  constructor(cacheSize: number) {
    this.cache = new LRU<string, Date>({ max: cacheSize, updateAgeOnGet: true });
  }

  add(object: TObject | TObject[]): void {
    (Array.isArray(object) ? object : [object]).forEach((obj) =>
      this.cache.set(MD5(obj.id || obj), new Date())
    );
  }

  has(object: TObject): boolean {
    return this.cache.get(MD5(object.id || object)) !== undefined;
  }
}
