/*
 *  Author: Hudson S. Borges
 */
import { Job } from 'bullmq';
import { chunk } from 'lodash';
import { mapSeries } from 'bluebird';
import { NotFoundError, RetryableError } from '../helpers/errors';
import knex, { Actor, Metadata } from '@gittrends/database-config';

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
        await knex.transaction((trx) =>
          Promise.all([
            Actor.upsert(actors, trx),
            Metadata.upsert(
              actors.map((actor) => ({
                id: actor.id,
                resource: 'actor',
                key: 'updatedAt',
                value: new Date().toISOString()
              })),
              trx
            )
          ])
        );
      })
      .catch(async (err) => {
        if (err instanceof RetryableError || err instanceof NotFoundError) {
          if (ids.length > 1) {
            return mapSeries(chunk(ids, Math.ceil(ids.length / 2)), (_ids) => this.$update(_ids));
          }

          const meta = { id: ids[0], resource: 'actor' };
          await Metadata.upsert([
            { ...meta, key: 'error', value: err.message },
            { ...meta, key: 'updatedAt', value: new Date().toISOString() }
          ]);
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
