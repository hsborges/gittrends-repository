import { cargoQueue, QueueObject } from 'async';
import Model from '@gittrends/database-config/dist/models/Model';
import knex from '@gittrends/database-config';

import Cache from './Cache';

export type WriterQueueArguments = {
  model: Model;
  data: TObject | TObject[];
  operation: 'insert' | 'upsert' | 'update';
};

export default class WriterQueue {
  private readonly queue: Record<string, QueueObject<WriterQueueArguments>>;
  private readonly cache?: Cache;

  constructor(cacheSize?: number) {
    if (cacheSize) this.cache = new Cache(cacheSize);
    this.queue = {};
  }

  push(opts: WriterQueueArguments): Promise<void> {
    const queueName = `${opts.model.constructor.name}_${opts.operation}`;

    if (!this.queue[queueName]) {
      this.queue[queueName] = cargoQueue((tasks, callback) => {
        const data = tasks
          .reduce((acc: TObject[], task) => acc.concat(task.data), [])
          .filter((record) => !this.cache?.has(record));

        if (!data.length) return callback();

        knex
          .transaction((trx) => opts.model[opts.operation](data, trx))
          .then(() => {
            this.cache?.add(data);
            callback();
          })
          .catch(callback);
      }, 1);
    }

    return this.queue[queueName].pushAsync(opts);
  }
}
