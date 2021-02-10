/*
 *  Author: Hudson S. Borges
 */
import { Job } from 'bullmq';
import { chunk } from 'lodash';
import { mapSeries } from 'bluebird';
import { NotFoundError, RetryableError } from '../helpers/errors';
import client, { Actor } from '@gittrends/database-config';

import Updater from './Updater';
import Query from '../github/Query';
import ActorComponent from '../github/components/ActorComponent';

export default class ActorsUpdater implements Updater {
  readonly id: string[] | string;
  readonly job?: Job<{ id: string | string[] }>;

  constructor(id: string[] | string, opts?: { job: Job<{ id: string | string[] }> }) {
    this.id = id;
    this.job = opts?.job;
  }

  async $update(ids: string[]): Promise<void> {
    const components = ids.map((id, index) => new ActorComponent(id).setAlias(`actor_${index}`));

    await Query.create()
      .compose(...components)
      .then(async ({ actors }) => {
        const session = client.startSession();

        session
          .withTransaction(() =>
            Actor.upsert(
              actors.map((actor) => Object.assign({ _metadata: { updatedAt: new Date() } }, actor)),
              session
            ).catch(async (err) => {
              await session.abortTransaction();
              throw err;
            })
          )
          .finally(() => session.endSession());
      })
      .catch(async (err) => {
        if (err instanceof RetryableError || err instanceof NotFoundError) {
          if (ids.length > 1)
            return mapSeries(chunk(ids, Math.ceil(ids.length / 2)), (_ids) => this.$update(_ids));

          return Actor.collection.updateOne(
            { _id: ids[0] },
            { $set: { _metadata: { updatedAt: new Date(), error: err.message } } }
          );
        }

        throw err;
      });
  }

  async update(): Promise<void> {
    return this.$update(Array.isArray(this.id) ? this.id : [this.id]).then(() => {
      if (this.job) this.job.updateProgress(100);
    });
  }
}
