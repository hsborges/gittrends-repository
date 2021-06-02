/*
 *  Author: Hudson S. Borges
 */
import LfuSet from 'collections/lfu-set';
import hasher from 'node-object-hash';

export default class UpdaterCache {
  readonly cache: LfuSet<string>;
  readonly hashSortCoerce = hasher({ sort: true, coerce: true });

  constructor(cacheSize: number) {
    this.cache = new LfuSet<string>([], cacheSize);
  }

  add(object: TObject | TObject[]): void {
    (Array.isArray(object) ? object : [object]).forEach((obj) =>
      this.cache.add(this.hashSortCoerce.hash(obj.id ? { id: obj.id } : obj))
    );
  }

  has(object: TObject): boolean {
    return this.cache.has(this.hashSortCoerce.hash(object.id ? { id: object.id } : object));
  }
}
