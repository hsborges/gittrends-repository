import { cargoQueue, QueueObject } from 'async';
import knex, { Model } from '@gittrends/database-config';

import Cache from './Cache';

export type WriterQueueArguments = {
  model: Model;
  data: TObject | TObject[];
  operation: 'insert' | 'upsert' | 'update';
};

export default class WriterQueue {
  private readonly queue: Record<string, QueueObject<WriterQueueArguments>>;
  private readonly concurrency: number;
  private readonly cache?: Cache;

  constructor(concurrency: number, cacheSize?: number) {
    if (cacheSize) this.cache = new Cache(cacheSize);
    this.concurrency = concurrency;
    this.queue = {};
  }

  push(opts: WriterQueueArguments): Promise<void> {
    const queueName = `${opts.model.constructor.name}_${opts.operation}`;

    if (!this.queue[queueName]) {
      this.queue[queueName] = cargoQueue(async (tasks) => {
        const data = tasks
          .reduce((acc: TObject[], task) => acc.concat(task.data), [])
          .filter((record) => !this.cache?.has(record));

        if (!data.length) return;

        return knex
          .transaction((trx) => opts.model[opts.operation](data, trx))
          .then(async () => this.cache?.add(data));
      }, 1);
    }

    return this.queue[queueName].pushAsync(opts);
  }
}
