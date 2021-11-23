/*
 *  Author: Hudson S. Borges
 */
import { map } from 'bluebird';
import { Job } from 'bullmq';
import { flatten, shuffle } from 'lodash';

import Query from '../github/Query';
import { RepositoryUpdateError, RequestError } from '../helpers/errors';
import Cache from './Cache';
import AbstractRepositoryHandler from './handlers/AbstractRepositoryHandler';
import DependenciesHandler from './handlers/DependenciesHandler';
import IssuesHander from './handlers/IssueHandler';
import ReleasesHandler from './handlers/ReleasesHandler';
import RepositoryHander from './handlers/RepositoryHandler';
import StargazersHandler from './handlers/StargazersHandler';
import TagsHandler from './handlers/TagsHandler';
import WatchersHandler from './handlers/WatchersHandler';
import Updater from './Updater';

export type THandler =
  | 'dependencies'
  | 'issues'
  | 'pull_requests'
  | 'repository'
  | 'releases'
  | 'stargazers'
  | 'tags'
  | 'watchers';

type TJob = { id: string | string[]; resources: string[]; done?: string[]; errors?: string[] };
type TOptions = { job?: Job<TJob>; cache?: Cache };

export default class RepositoryUpdater implements Updater {
  readonly id: string;
  readonly job?: Job<TJob>;
  readonly handlers: AbstractRepositoryHandler[] = [];
  readonly errors: { handler: AbstractRepositoryHandler; error: Error }[] = [];

  constructor(repositoryId: string, handlers: THandler[], opts?: TOptions) {
    this.id = repositoryId;
    this.job = opts?.job;
    if (handlers.includes('dependencies')) this.handlers.push(new DependenciesHandler(this.id));
    if (handlers.includes('issues'))
      this.handlers.push(new IssuesHander(this.id, undefined, 'issues'));
    if (handlers.includes('pull_requests'))
      this.handlers.push(new IssuesHander(this.id, undefined, 'pull_requests'));
    if (handlers.includes('repository')) this.handlers.push(new RepositoryHander(this.id));
    if (handlers.includes('releases')) this.handlers.push(new ReleasesHandler(this.id));
    if (handlers.includes('stargazers')) this.handlers.push(new StargazersHandler(this.id));
    if (handlers.includes('tags')) this.handlers.push(new TagsHandler(this.id));
    if (handlers.includes('watchers')) this.handlers.push(new WatchersHandler(this.id));

    this.handlers.forEach((handler) => (handler.cache = opts?.cache));
  }

  async update(handlers = this.pendingHandlers, isRetry?: boolean): Promise<void> {
    if (handlers.length === 0) return;

    return Query.create()
      .compose(...flatten(await Promise.all(handlers.map((handler) => handler.component()))))
      .run()
      .then((data) => Promise.all(handlers.map((handler) => handler.update(data))))
      .catch(async (err) => {
        if (err instanceof RequestError) {
          return map(shuffle(handlers), (handler) =>
            this.update([handler], true).catch((err) =>
              handler.error(err).catch((err2) => this.errors.push({ handler, error: err2 }))
            )
          );
        }

        throw err;
      })
      .finally(async () => {
        if (isRetry) return;
        if (this.job && handlers.find((h) => h.isDone())) {
          this.job?.updateProgress(
            Math.ceil((this.doneHandlers.length / this.handlers.length) * 100)
          );

          await this.job?.update({
            ...this.job.data,
            resources: this.pendingHandlers.map((h) => h.meta.resource),
            done: this.doneHandlers.map((h) => h.meta.resource),
            errors: this.errors.map((e) => e.handler.meta.resource)
          });
        }
      })
      .then(() => {
        if (isRetry) return;
        if (this.pendingHandlers.length) return this.update(this.pendingHandlers);
        if (this.errors.length > 0)
          throw new RepositoryUpdateError(this.errors.map((e) => e.error));
      });
  }

  private get pendingHandlers(): AbstractRepositoryHandler[] {
    return this.handlers.filter(
      (handler) => !handler.isDone() && !this.errors.find((e) => e.handler === handler)
    );
  }

  private get doneHandlers(): AbstractRepositoryHandler[] {
    return this.handlers.filter(
      (handler) => handler.isDone() || this.errors.find((e) => e.handler === handler)
    );
  }
}
