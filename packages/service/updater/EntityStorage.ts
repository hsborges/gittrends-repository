/*
 *  Author: Hudson S. Borges
 */
import { isEqual, uniqWith } from 'lodash';

import { Entity, MongoRepository } from '@gittrends/database';
import { Actor, Commit, Milestone } from '@gittrends/database';

import { Cache } from './Cache';

export const EntityStorageMetadata: {
  [key: symbol]: { priority: number; cache?: boolean; operation?: 'insert' | 'upsert' };
} = {
  [Symbol.for(Actor.name)]: { priority: 10, cache: true, operation: 'insert' },
  [Symbol.for(Milestone.name)]: { priority: 9, cache: true },
  [Symbol.for(Commit.name)]: { priority: 9, cache: true }
};

export class EntityStorage<T extends Entity> {
  private readonly cache?: Cache;
  private entities: T[] = [];

  constructor(cache?: Cache) {
    this.cache = cache;
  }

  add(records: T | T[]): void {
    this.entities.push(...(Array.isArray(records) ? records : [records]));
  }

  size(entity?: new () => T): number {
    if (entity) return this.entities.filter((e) => e.constructor === entity).length;
    return this.entities.length;
  }

  clean(entity?: new () => T): void {
    if (entity) this.entities = this.entities.filter((e) => e.constructor !== entity);
    else this.entities = [];
  }

  async persist(entity?: new () => T): Promise<void> {
    const entitiesGroup = this.entities.filter((e) => (entity ? e.constructor === entity : true));

    const groups = entitiesGroup
      .reduce((memo, curr) => {
        const key = Symbol.for(curr.constructor.name);
        const data = memo.find((m) => m.key === key);
        if (!data) memo.push({ key, entity: curr.constructor as new () => T, records: [curr] });
        else data.records.push(curr);
        return memo;
      }, [] as { key: symbol; entity: new () => T; records: T[] }[])
      .sort(
        (a, b) =>
          (EntityStorageMetadata[Symbol.for(b.entity.name)]?.priority || 0) -
          (EntityStorageMetadata[Symbol.for(a.entity.name)]?.priority || 0)
      );

    await Promise.all(
      groups.map(async ({ entity, records }) => {
        const entityMeta = EntityStorageMetadata[Symbol.for(entity.name)];
        const filteredRecords = uniqWith(
          entityMeta?.cache ? records.filter((r) => !this.cache?.has(r)) : records,
          (v1, v2) => isEqual(v1._id, v2._id)
        );
        if (filteredRecords.length === 0) return;
        await MongoRepository.get(entity)[entityMeta?.operation || 'upsert'](filteredRecords);
        return this.cache?.add(filteredRecords);
      })
    );

    this.entities = this.entities.filter((e) => !entitiesGroup.includes(e));
  }
}
