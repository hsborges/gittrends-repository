/*
 *  Author: Hudson S. Borges
 */
import { Job } from 'bee-queue';
import { chunk } from 'lodash';
import { mapSeries } from 'bluebird';
import { NotFoundError, RetryableError } from '../helpers/errors';
import { Actor } from '@gittrends/database-config';

import Updater from './Updater';
import Query from '../github/Query';
import parser from '../helpers/response-parser';
import ActorComponent from '../github/components/ActorComponent';

export default class ActorsUpdater implements Updater {
  readonly id: string[] | string;
  readonly job?: Job<{ id: string | string[] }>;

  constructor(id: string[] | string, opts?: { job: Job<{ id: string | string[] }> }) {
    this.id = id;
    this.job = opts?.job;
  }

  private async _update(ids: string[]): Promise<void> {
    const components = ids.map((id, index) => new ActorComponent(id).setAlias(`actor_${index}`));

    await Query.create()
      .compose(...components)
      .run()
      .then((response) => parser(response))
      .then(async ({ actors }) =>
        Actor.upsert(actors.map((actor) => ({ ...actor, _metadata: { updatedAt: new Date() } })))
      )
      .catch(async (err) => {
        if (err instanceof RetryableError || err instanceof NotFoundError) {
          if (ids.length > 1)
            return mapSeries(chunk(ids, Math.ceil(ids.length / 2)), (_ids) => this._update(_ids));

          return Actor.collection.updateOne(
            { _id: ids[0] },
            { $set: { _metadata: { updatedAt: new Date(), error: err.message } } }
          );
        }

        throw err;
      });
  }

  async update(): Promise<void> {
    return this._update(Array.isArray(this.id) ? this.id : [this.id]).then(() => {
      if (this.job) this.job.reportProgress(100);
    });
  }
}
