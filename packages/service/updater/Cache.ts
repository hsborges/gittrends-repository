/*
 *  Author: Hudson S. Borges
 */
import hasher from 'node-object-hash';
import QuickLRU from 'quick-lru';

import { Entity } from '@gittrends/database';

export class Cache {
  readonly cache: QuickLRU<string, number>;
  readonly hashSortCoerce = hasher({ sort: true, coerce: true });

  constructor(cacheSize: number) {
    this.cache = new QuickLRU({ maxSize: cacheSize });
  }

  private getKey(object: Entity): string {
    return object._id ? object._id : this.hashSortCoerce.hash(object.toJSON());
  }

  public add(object: Entity | Entity[]): void {
    (Array.isArray(object) ? object : [object]).map((object) =>
      this.cache.set(this.getKey(object), 1)
    );
  }

  public has(object: Entity): boolean {
    return this.cache.get(this.getKey(object)) === 1;
  }
}
