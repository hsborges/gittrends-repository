/*
 *  Author: Hudson S. Borges
 */
import LRU from 'lru-cache';
import hasher from 'node-object-hash';

import { Entity } from '@gittrends/database';

export class Cache {
  readonly cache: LRU<string, void>;
  readonly hashSortCoerce = hasher({ sort: true, coerce: true });

  constructor(cacheSize: number) {
    this.cache = new LRU({ max: cacheSize, updateAgeOnGet: true });
  }

  private getKey(object: Entity): string {
    return object._id ? object._id : this.hashSortCoerce.hash(object.toJSON());
  }

  public add(object: Entity | Entity[]): void {
    (Array.isArray(object) ? object : [object]).map((object) =>
      this.cache.set(this.getKey(object))
    );
  }

  public has(object: Entity): boolean {
    return this.cache.has(this.getKey(object));
  }
}
