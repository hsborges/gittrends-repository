/*
 *  Author: Hudson S. Borges
 */
import knex, { Actor, Commit } from '@gittrends/database-config';

import Updater from './Updater';
import Query from '../github/Query';
import RepositoryDetailsHander from './handlers/RepositoryHandler';
import AbstractRepositoryHandler from './handlers/AbstractRepositoryHandler';
import { pick } from 'lodash';
import { Job } from 'bull';

type THandler = 'repository' | 'stargazers' | 'watcher';

export default class RepositoryUpdater implements Updater {
  readonly id: string;
  readonly job: Job;
  readonly handlers: AbstractRepositoryHandler[] = [];

  constructor(repositoryId: string, handlers: THandler[], job: Job) {
    this.id = repositoryId;
    this.job = job;
    if (handlers.includes('repository')) this.handlers.push(new RepositoryDetailsHander(this.id));
  }

  private async _update(handlers: AbstractRepositoryHandler[]): Promise<void> {
    // prepare all handlers
    await Promise.all(handlers.map((handler) => handler.updateComponent()));

    // run queries and update handlers
    await Query.create()
      .compose(...handlers.map((handler) => handler.component))
      .then(async ({ data, actors = [], commits = [] }) => {
        await knex.transaction((trx) =>
          Promise.all([
            Actor.insert(actors, trx),
            Commit.insert(commits, trx),
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
