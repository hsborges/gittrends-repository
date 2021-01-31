/*
 *  Author: Hudson S. Borges
 */
import { each, map } from 'bluebird';
import { Job } from 'bullmq';
import knex, { Actor, Commit, Milestone } from '@gittrends/database-config';

import Updater from './Updater';
import Query from '../github/Query';
import RepositoryHander from './handlers/RepositoryHandler';
import AbstractRepositoryHandler from './handlers/AbstractRepositoryHandler';
import StargazersHandler from './handlers/StargazersHandler';
import WatchersHandler from './handlers/WatchersHandler';
import TagsHandler from './handlers/TagsHandler';
import { ValidationError } from '@gittrends/database-config/dist/models/Model';
import ReleasesHandler from './handlers/ReleasesHandler';
import Component from '../github/Component';
import DependenciesHander from './handlers/DependenciesHandler';
import IssuesHander from './handlers/IssueHandler';
import { ResourceUpdateError } from '../helpers/errors';
import WriterQueue, { WriterQueueArguments } from './WriterQueue';

export type THandler =
  | 'dependencies'
  | 'issues'
  | 'pull_requests'
  | 'repository'
  | 'releases'
  | 'stargazers'
  | 'tags'
  | 'watchers';

type TJob = { id: string | string[]; resources: string[]; done: string[]; errors: string[] };
type TOptions = { job?: Job<TJob>; writerQueue?: WriterQueue };

export default class RepositoryUpdater implements Updater {
  readonly id: string;
  readonly job?: Job<TJob>;
  readonly writerQueue?: WriterQueue;
  readonly handlers: AbstractRepositoryHandler[] = [];
  readonly errors: { handler: AbstractRepositoryHandler; error: Error }[] = [];

  constructor(repositoryId: string, handlers: THandler[], opts?: TOptions) {
    this.id = repositoryId;
    this.job = opts?.job;
    this.writerQueue = opts?.writerQueue;
    if (handlers.includes('dependencies')) this.handlers.push(new DependenciesHander(this.id));
    if (handlers.includes('issues'))
      this.handlers.push(new IssuesHander(this.id, undefined, 'issues'));
    if (handlers.includes('pull_requests'))
      this.handlers.push(new IssuesHander(this.id, undefined, 'pull_requests'));
    if (handlers.includes('repository')) this.handlers.push(new RepositoryHander(this.id));
    if (handlers.includes('releases')) this.handlers.push(new ReleasesHandler(this.id));
    if (handlers.includes('stargazers')) this.handlers.push(new StargazersHandler(this.id));
    if (handlers.includes('tags')) this.handlers.push(new TagsHandler(this.id));
    if (handlers.includes('watchers')) this.handlers.push(new WatchersHandler(this.id));
  }

  private async _update(handlers: AbstractRepositoryHandler[]): Promise<void> {
    // get components
    const components = (await map(handlers, (handler) => handler.component())).reduce(
      (acc: Component[], result) => acc.concat(result),
      []
    );

    // run queries and update handlers
    await Query.create()
      .compose(...components)
      .then(async ({ data, actors = [], commits = [], milestones = [] }) => {
        const baseWriter = (opts: WriterQueueArguments) =>
          this.writerQueue
            ? this.writerQueue.push(opts)
            : opts.model[opts.operation ?? 'insert'](opts.data);

        await knex.transaction((trx) =>
          Promise.all([
            baseWriter({ model: Actor, data: actors, operation: 'insert' }),
            baseWriter({ model: Commit, data: commits, operation: 'insert' }),
            baseWriter({ model: Milestone, data: milestones, operation: 'insert' }),
            map(handlers, (handler) => handler.update(data as TObject, trx))
          ])
        );

        const doneHandlers = handlers.filter((handler) => {
          if (this.job && handler.isDone()) {
            this.job.update({
              ...this.job.data,
              resources: this.job.data.resources.filter((r) => r !== handler.meta.resource),
              done: [...(this.job.data.done || []), handler.meta.resource]
            });
            return true;
          }
        });

        if (this.job && doneHandlers.length) {
          const totalDone = this.handlers.reduce((acc: number, h) => acc + (h.isDone() ? 1 : 0), 0);
          this.job.updateProgress(Math.ceil((totalDone / this.handlers.length) * 100));
        }
      })
      .catch(async (err) => {
        if (err instanceof ValidationError) throw err;
        if (handlers.length === 1) return handlers[0].error(err);
        return each(
          handlers.filter((handler) => handler.hasNextPage()),
          (handler) => this._update([handler])
        );
      })
      .catch(async (err) => {
        if (handlers.length === 1) {
          this.errors.push({ handler: handlers[0], error: err });
          this.job?.update({
            ...this.job.data,
            resources: this.job.data.resources.filter((r) => r !== handlers[0].meta.resource),
            errors: [...(this.job.data.errors || []), handlers[0].meta.resource]
          });
          return;
        }
        throw err;
      });
  }

  async update(): Promise<void> {
    while (this.hasNextPage()) await this._update(this.pendingHandlers());

    if (this.errors.length)
      throw new ResourceUpdateError(this.errors.map((e) => e.error.message).join(', '));
  }

  pendingHandlers(): AbstractRepositoryHandler[] {
    return this.handlers.filter(
      (handler) => handler.hasNextPage() && this.errors.findIndex((e) => e.handler === handler) < 0
    );
  }

  hasNextPage(): boolean {
    return this.pendingHandlers().length > 0;
  }
}
