/*
 *  Author: Hudson S. Borges
 */
import { Job } from 'bullmq';
import { chunk } from 'lodash';

import { Actor, MongoRepository } from '@gittrends/database';

import ActorComponent from '../github/components/ActorComponent';
import HttpClient from '../github/HttpClient';
import Query from '../github/Query';
import { NotFoundError, RetryableError } from '../helpers/errors';
import responseParser from '../helpers/response-parser';
import Updater from './Updater';

export class ActorsUpdater implements Updater {
  private readonly id: string[] | string;
  private readonly httpClient: HttpClient;
  private readonly job?: Job<{ id: string | string[] }>;

  constructor(
    id: string[] | string,
    httpClient: HttpClient,
    opts?: { job: Job<{ id: string | string[] }> }
  ) {
    this.id = id;
    this.httpClient = httpClient;
    this.job = opts?.job;
  }

  private async _update(ids: string[]): Promise<void> {
    const components = ids.map((id, index) => new ActorComponent(id).setAlias(`actor_${index}`));

    await Query.create(this.httpClient)
      .compose(...components)
      .run()
      .then((response) => responseParser(response))
      .then(async ({ actors }) =>
        MongoRepository.get(Actor).upsert(
          actors.map((actor) => new Actor({ ...actor, _metadata: { updatedAt: new Date() } }))
        )
      )
      .catch(async (err) => {
        if (err instanceof RetryableError || err instanceof NotFoundError) {
          if (ids.length > 1) {
            for (const idsChunk of chunk(ids, Math.ceil(ids.length / 2)))
              await this._update(idsChunk);
          }

          return MongoRepository.get(Actor).collection.updateOne(
            { _id: ids[0] },
            { $set: { _metadata: { updatedAt: new Date(), error: err.message } } }
          );
        }

        throw err;
      });
  }

  async update(): Promise<void> {
    return this._update(Array.isArray(this.id) ? this.id : [this.id]).then(() => {
      if (this.job) this.job.updateProgress(100);
    });
  }
}
