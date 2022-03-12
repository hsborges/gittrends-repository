/*
 *  Author: Hudson S. Borges
 */
import { isEqual } from 'lodash';

import { Entity } from '@gittrends/database';
import * as Entities from '@gittrends/database';

import { useSharedConnection } from '../rabbitmq';
import { Cache } from './Cache';

type OperationTypes = 'insert' | 'upsert';

export const EntityStorageMetadata: {
  [key: symbol]: { cache?: boolean; operation: OperationTypes };
} = {
  [Symbol.for(Entities.Actor.name)]: { cache: true, operation: 'insert' },
  [Symbol.for(Entities.Commit.name)]: { cache: true, operation: 'insert' },
  [Symbol.for(Entities.Dependency.name)]: { operation: 'insert' },
  [Symbol.for(Entities.ErrorLog.name)]: { operation: 'insert' },
  [Symbol.for(Entities.GithubToken.name)]: { operation: 'insert' },
  [Symbol.for(Entities.Issue.name)]: { operation: 'upsert' },
  [Symbol.for(Entities.Location.name)]: { cache: true, operation: 'insert' },
  [Symbol.for(Entities.Milestone.name)]: { cache: true, operation: 'upsert' },
  [Symbol.for(Entities.PullRequest.name)]: { operation: 'upsert' },
  [Symbol.for(Entities.Reaction.name)]: { operation: 'insert' },
  [Symbol.for(Entities.Release.name)]: { cache: true, operation: 'insert' },
  [Symbol.for(Entities.Repository.name)]: { operation: 'upsert' },
  [Symbol.for(Entities.Stargazer.name)]: { operation: 'insert' },
  [Symbol.for(Entities.Tag.name)]: { cache: true, operation: 'insert' },
  [Symbol.for(Entities.TimelineEvent.name)]: { operation: 'insert' },
  [Symbol.for(Entities.Watcher.name)]: { operation: 'insert' }
};

export class EntityStorage<T extends Entity> {
  private readonly cache?: Cache;
  private entities: T[] = [];

  constructor(cache?: Cache) {
    this.cache = cache;
  }

  add(records: T | T[]): void {
    const filteredRecords = (Array.isArray(records) ? records : [records])
      .filter(
        (r) => !(EntityStorageMetadata[Symbol.for(r.constructor.name)]?.cache && this.cache?.has(r))
      )
      .filter(
        (r) => !this.entities.find((e) => e.constructor === r.constructor && isEqual(e._id, r._id))
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
        const entityMeta = EntityStorageMetadata[Symbol.for(curr.constructor.name)];
        if (!entityMeta?.cache || !this.cache?.has(curr)) {
          const entity = curr.constructor.name;
          const data = memo.find((m) => m.entity === entity);
          if (!data) memo.push({ entity, records: [curr], operation: entityMeta.operation });
          else data.records.push(curr);
        }

        return memo;
      }, [] as { entity: string; records: T[]; operation?: OperationTypes }[])
      .filter((group) => group.records.length > 0);

    const channel = await useSharedConnection();

    await new Promise((resolve, reject) => {
      channel.sendToQueue(
        'entities',
        Buffer.from(JSON.stringify(groups)),
        { appId: 'EntityStorage', persistent: true },
        (err) => (err ? reject(err) : resolve())
      );
    });

    for (const { entity, records } of groups) {
      if (EntityStorageMetadata[Symbol.for(entity)]?.cache) this.cache?.add(records);
    }

    this.entities = this.entities.filter((e) => !entitiesGroup.includes(e));
  }
}
