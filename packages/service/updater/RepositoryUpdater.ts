/*
 *  Author: Hudson S. Borges
 */
import { Job } from 'bee-queue';
import { flatten } from 'lodash';

import Query from '../github/Query';
import { RepositoryUpdateError, RequestError } from '../helpers/errors';
import { Cache } from './Cache';
import AbstractRepositoryHandler from './handlers/AbstractRepositoryHandler';
import DependenciesHandler from './handlers/DependenciesHandler';
import IssuesHander from './handlers/IssueHandler';
import ReleasesHandler from './handlers/ReleasesHandler';
import RepositoryHander from './handlers/RepositoryHandler';
import StargazersHandler from './handlers/StargazersHandler';
import TagsHandler from './handlers/TagsHandler';
import WatchersHandler from './handlers/WatchersHandler';
import Updater from './Updater';

export type RepositoryUpdaterHandler =
  | 'dependencies'
  | 'issues'
  | 'pull_requests'
  | 'repository'
  | 'releases'
  | 'stargazers'
  | 'tags'
  | 'watchers';

type RepositoryUpdaterJob = {
  id: string | string[];
  resources: string[];
  done?: string[];
  errors?: string[];
};

type RepositoryUpdaterOptions = { job?: Job<RepositoryUpdaterJob>; cache?: Cache };

export class RepositoryUpdater implements Updater {
  readonly id: string;
  readonly job?: Job<RepositoryUpdaterJob>;
  readonly handlers: AbstractRepositoryHandler[] = [];
  readonly errors: { handler: AbstractRepositoryHandler; error: Error }[] = [];

  constructor(
    repositoryId: string,
    handlers: RepositoryUpdaterHandler[],
    opts?: RepositoryUpdaterOptions
  ) {
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

  async update(handlers = this.filterPending(this.handlers), isRetry?: boolean): Promise<void> {
    let pendingHandlers = handlers;
    if (pendingHandlers.length === 0) return;

    do {
      await Query.create()
        .compose(
          ...flatten(await Promise.all(pendingHandlers.map((handler) => handler.component())))
        )
        .run()
        .then((data) => Promise.all(pendingHandlers.map((handler) => handler.update(data))))
        .catch(async (err) => {
          if (isRetry || !(err instanceof RequestError)) throw err;

          await Promise.all(
            pendingHandlers.map((handler) =>
              this.update([handler], true).catch((err) =>
                handler.error(err).catch((err2) => this.errors.push({ handler, error: err2 }))
              )
            )
          );
        })
        .finally(async () => {
          if (isRetry) return;

          if (this.job && this.filterDone(pendingHandlers).length > 0) {
            this.job?.reportProgress({
              pending: this.filterPending(handlers).map((h) => h.meta.resource),
              done: this.filterDone(handlers).map((h) => h.meta.resource),
              errors: this.errors.map((e) => e.handler.meta.resource)
            });
          }
        });

      pendingHandlers = this.filterPending(pendingHandlers);

      if (global.gc) global.gc();
    } while (!isRetry && pendingHandlers.length > 0);

    if (!isRetry)
      if (this.errors.length > 0) throw new RepositoryUpdateError(this.errors.map((e) => e.error));
  }

  private filterPending(handlers: AbstractRepositoryHandler[]): AbstractRepositoryHandler[] {
    return handlers.filter(
      (handler) => !handler.isDone() && !this.errors.find((e) => e.handler === handler)
    );
  }

  private filterDone(handlers: AbstractRepositoryHandler[]): AbstractRepositoryHandler[] {
    const pending = this.filterPending(handlers);
    return handlers.filter((handler) => pending.indexOf(handler) < 0);
  }
}
