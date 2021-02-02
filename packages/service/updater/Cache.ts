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
    if (Array.isArray(object)) object.map((o) => this.add(o));
    else this.cache.set(MD5(object.id || object), new Date());
  }

  has(object: TObject): boolean {
    return this.cache.get(MD5(object.id || object)) !== undefined;
  }
}
