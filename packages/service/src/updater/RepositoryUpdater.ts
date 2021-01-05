/*
 *  Author: Hudson S. Borges
 */
import Debug from 'debug';
import { Job } from 'bull';
import { pick } from 'lodash';
import knex, { Actor, Commit } from '@gittrends/database-config';

import Cache from './Cache';
import Updater from './Updater';
import Query from '../github/Query';
import RepositoryDetailsHander from './handlers/RepositoryHandler';
import AbstractRepositoryHandler from './handlers/AbstractRepositoryHandler';
import StargazersHandler from './handlers/StargazersHandler';
import WatchersHandler from './handlers/WatchersHandler';
import TagsHandler from './handlers/TagsHandler';
import { ValidationError } from '@gittrends/database-config/dist/models/Model';

type THandler = 'repository' | 'stargazers' | 'tags' | 'watchers';
type TOptions = { job?: Job; cache?: Cache };

const debug = Debug('updater:repository-updater');

export default class RepositoryUpdater implements Updater {
  readonly id: string;
  readonly job?: Job;
  readonly cache?: Cache;
  readonly handlers: AbstractRepositoryHandler[] = [];

  constructor(repositoryId: string, handlers: THandler[], opts?: TOptions) {
    this.id = repositoryId;
    this.job = opts?.job;
    this.cache = opts?.cache;
    if (handlers.includes('repository')) this.handlers.push(new RepositoryDetailsHander(this.id));
    if (handlers.includes('stargazers')) this.handlers.push(new StargazersHandler(this.id));
    if (handlers.includes('tags')) this.handlers.push(new TagsHandler(this.id));
    if (handlers.includes('watchers')) this.handlers.push(new WatchersHandler(this.id));
  }

  private async _update(handlers: AbstractRepositoryHandler[]): Promise<void> {
    // prepare all handlers
    await Promise.all(handlers.map((handler) => handler.updateComponent()));

    // run queries and update handlers
    await Query.create()
      .compose(...handlers.map((handler) => handler.component))
      .then(async ({ data, actors = [], commits = [] }) => {
        actors = actors.filter((actor) => !this.cache?.has(actor));
        commits = commits.filter((commit) => !this.cache?.has(commit));

        debug(
          `Updating db (actors=${actors.length}; commits=${commits.length}) and ${handlers.length} handlers ...`
        );
        await knex.transaction((trx) =>
          Promise.all([
            Actor.insert(actors, trx).then(() => this.cache?.add(actors)),
            Commit.insert(commits, trx).then(() => this.cache?.add(actors)),
            Promise.all(
              handlers.map((handler) => handler.updateDatabase(pick(data, handler.alias), trx))
            )
          ])
        );

        handlers.forEach((handler) => {
          if (handler.done && this.job) {
            const pending = this.handlers.filter((handler) => handler.hasNextPage);
            this.job.progress(Math.ceil((1 - pending.length / this.handlers.length) * 100));
            this.job.update({
              ...this.job.data,
              resources: this.job.data.resources.filter((r: string) => r !== handler.meta.resource),
              done: [...(this.job.data.done || []), handler.meta.resource]
            });
          }
        });
      })
      .catch(async (err) => {
        debug(`Error: ${err.message}`);
        if (err instanceof ValidationError) throw err;
        if (handlers.length === 1) return handlers[0].error(err);
        else return Promise.all(handlers.map((handler) => this._update([handler])));
      });
  }

  async update(): Promise<void> {
    while (this.hasNextPage()) {
      await this._update(this.handlers.filter((handler) => handler.hasNextPage));
    }
  }

  hasNextPage(): boolean {
    return this.handlers.reduce((acc: boolean, handler) => acc || handler.hasNextPage, false);
  }
}
