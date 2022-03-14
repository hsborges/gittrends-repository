/*
 *  Author: Hudson S. Borges
 */
import { Entity } from '@gittrends/database';
import * as Entities from '@gittrends/database';

import { createChannel } from '../rabbitmq';
import { Cache } from './Cache';

type OperationTypes = 'insert' | 'upsert';

export const CACHABLE_ENTITIES = [
  Entities.Actor,
  Entities.Commit,
  Entities.Location,
  Entities.Release,
  Entities.Tag
].map((e) => e.name);

export class EntityStorage<T extends Entity> {
  private readonly cache?: Cache;
  private entities: T[] = [];

  constructor(cache?: Cache) {
    this.cache = cache;
  }

  add(records: T | T[]): void {
    const filteredRecords = (Array.isArray(records) ? records : [records])
      .filter((r) => !(CACHABLE_ENTITIES.indexOf(r.constructor.name) >= 0 && this.cache?.has(r)))
      .filter(
        (r) => !this.entities.find((e) => e.constructor === r.constructor && e._id === r._id)
      );
    this.entities.push(...filteredRecords);
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
        if (!CACHABLE_ENTITIES.indexOf(curr.constructor.name) || !this.cache?.has(curr)) {
          const data = memo.find((m) => m.entity === curr.constructor.name);
          if (!data) memo.push({ entity: curr.constructor.name, records: [curr] });
          else data.records.push(curr);
        }

        return memo;
      }, [] as { entity: string; records: T[]; operation?: OperationTypes }[])
      .filter((group) => group.records.length > 0);

    const channel = await createChannel();

    for (const { entity, records } of groups) {
      channel.sendToQueue(entity, Buffer.from(JSON.stringify(records)), {
        appId: 'EntityStorage',
        persistent: true
      });

      await channel.waitForConfirms();
    }

    await channel.close();

    for (const { entity, records } of groups) {
      if (CACHABLE_ENTITIES.indexOf(entity)) this.cache?.add(records);
    }

    this.entities = this.entities.filter((e) => !entitiesGroup.includes(e));
  }
}
