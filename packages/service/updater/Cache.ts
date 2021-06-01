/*
 *  Author: Hudson S. Borges
 */
import LfuSet from 'collections/lfu-set';
import { MD5 } from 'object-hash';

export default class UpdaterCache {
  readonly cache: LfuSet<string>;

  constructor(cacheSize: number) {
    this.cache = new LfuSet<string>([], cacheSize);
  }

  add(object: TObject | TObject[]): void {
    (Array.isArray(object) ? object : [object]).forEach((obj) =>
      this.cache.add(MD5(obj.id ? { id: obj.id } : obj))
    );
  }

  has(object: TObject): boolean {
    return this.cache.has(MD5(object.id ? { id: object.id } : object));
  }
}
