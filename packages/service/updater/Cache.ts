/*
 *  Author: Hudson S. Borges
 */
import { newCache, Cache } from 'transitory';
import { MD5 } from 'object-hash';

export default class UpdaterCache {
  readonly cache: Cache<string, Date>;

  constructor(cacheSize: number) {
    this.cache = newCache().maxSize(cacheSize).build() as Cache<string, Date>;
  }

  add(object: TObject | TObject[]): void {
    if (Array.isArray(object)) object.map((o) => this.add(o));
    else this.cache.set(MD5(object), new Date());
  }

  has(object: TObject): boolean {
    return this.cache.has(MD5(object));
  }
}
