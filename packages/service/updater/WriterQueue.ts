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
  readonly queue: QueueObject<WriterQueueArguments>;

  constructor(concurrency = 1) {
    this.queue = queue(({ model, data, operation = 'insert', transaction }, callback) => {
      model[operation](data, transaction)
        .then(() => callback())
        .catch(callback);
    }, concurrency);
  }

  push(opts: WriterQueueArguments): Promise<void> {
    return this.queue.pushAsync(opts);
  }
}
