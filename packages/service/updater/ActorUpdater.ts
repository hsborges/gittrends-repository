/*
 *  Author: Hudson S. Borges
 */
import EventEmitter from 'events';
import { chunk } from 'lodash';

import { Actor, Metadata, MongoRepository } from '@gittrends/database';

import ActorComponent from '../github/components/ActorComponent';
import HttpClient from '../github/HttpClient';
import Query from '../github/Query';
import { GithubRequestError, RequestError } from '../helpers/errors';
import responseParser from '../helpers/response-parser';
import Updater from './Updater';

export class ActorsUpdater extends EventEmitter implements Updater {
  private readonly id: string[] | string;
  private readonly httpClient: HttpClient;

  constructor(id: string[] | string, httpClient: HttpClient) {
    super();
    this.id = id;
    this.httpClient = httpClient;
  }

  private async _update(ids: string[]): Promise<void> {
    const components = ids.map((id, index) => new ActorComponent(id).setAlias(`actor_${index}`));

    await Query.create(this.httpClient)
      .compose(...components)
      .run()
      .then((response) => responseParser(response))
      .then(async ({ actors }) =>
        Promise.all([
          MongoRepository.get(Actor).upsert(actors),
          MongoRepository.get(Metadata).upsert(
            actors.map((actor) => ({ _id: actor._id, updatedAt: new Date() }))
          )
        ])
      )
      .catch(async (err) => {
        if (err instanceof RequestError) {
          if (ids.length > 1) {
            for (const idsChunk of chunk(ids, Math.ceil(ids.length / 2)))
              await this._update(idsChunk);
          } else {
            let metadata: any = { updatedAt: new Date() };

            if (err instanceof GithubRequestError && err.all('NOT_FOUND')) {
              metadata = { ...metadata, removed: true, removed_at: new Date() };
            } else {
              metadata = { ...metadata, error: err.message };
            }

            return MongoRepository.get(Actor).collection.replaceOne({ _id: ids[0] }, metadata, {
              upsert: true
            });
          }
        }

        throw err;
      });
  }

  async update(): Promise<void> {
    await this._update(Array.isArray(this.id) ? this.id : [this.id]);
    this.emit('progress', 100);
  }
}
