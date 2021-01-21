import { Transaction } from 'knex';
import { queue, QueueObject } from 'async';
import Model from '@gittrends/database-config/dist/models/Model';

export type WriterQueueArguments = {
  model: Model;
  data: TObject | TObject[];
  operation?: 'insert' | 'upsert' | 'update';
  transaction?: Transaction;
};

export default class WriterQueue {
  readonly queue: Record<string, QueueObject<WriterQueueArguments>>;
  readonly concurrency: number;

  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.queue = {};
  }

  push(opts: WriterQueueArguments): Promise<void> {
    const queueName = opts.model.constructor.name;

    if (!this.queue[queueName]) {
      this.queue[queueName] = queue(
        ({ model, data, operation = 'insert', transaction }, callback) => {
          model[operation](data, transaction)
            .then(() => callback())
            .catch(callback);
        },
        this.concurrency
      );
    }

    return this.queue[queueName].pushAsync(opts);
  }
}
