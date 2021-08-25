/*
 *  Author: Hudson S. Borges
 */
import { Job } from 'bullmq';
import { map } from 'bluebird';
import { flatten } from 'lodash';

import Cache from './Cache';
import Updater from './Updater';
import Query from '../github/Query';
import RepositoryHander from './handlers/RepositoryHandler';
import AbstractRepositoryHandler from './handlers/AbstractRepositoryHandler';
import StargazersHandler from './handlers/StargazersHandler';
import WatchersHandler from './handlers/WatchersHandler';
import TagsHandler from './handlers/TagsHandler';
import ReleasesHandler from './handlers/ReleasesHandler';
import DependenciesHander from './handlers/DependenciesHandler';
import IssuesHander from './handlers/IssueHandler';
import { ResourceUpdateError } from '../helpers/errors';
import { ValidationError } from '@gittrends/database-config/dist/models/Model';

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
type TOptions = { job?: Job<TJob>; cache?: Cache };

export default class RepositoryUpdater implements Updater {
  readonly id: string;
  readonly job?: Job<TJob>;
  readonly handlers: AbstractRepositoryHandler[] = [];
  readonly errors: { handler: AbstractRepositoryHandler; error: Error }[] = [];

  constructor(repositoryId: string, handlers: THandler[], opts?: TOptions) {
    this.id = repositoryId;
    this.job = opts?.job;
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

    this.handlers.forEach((handler) => (handler.cache = opts?.cache));
  }

  async update(handlers = this.pendingHandlers, isRetry?: boolean): Promise<void> {
    return Query.create()
      .compose(...flatten(await map(handlers, (handler) => handler.component())))
      .run()
      .then(async (data) => {
        await map(handlers, async (handler) => handler.update(data));
      })
      .catch(async (err) => {
        if (isRetry || err instanceof ValidationError) throw err;

        return map(handlers, (handler) =>
          this.update([handler], true).catch((err) =>
            handler.error(err).catch((err2) => {
              this.errors.push({ handler, error: err2 });
              this.job?.update({
                ...this.job.data,
                resources: this.job.data.resources.filter((r) => r !== handler.meta.resource),
                errors: [...(this.job.data.errors || []), handler.meta.resource]
              });
            })
          )
        );
      })
      .finally(() => {
        if (isRetry) return;

        if (this.job && handlers.find((h) => h.isDone())) {
          this.job.updateProgress(
            Math.ceil((this.doneHandlers.length / this.handlers.length) * 100)
          );
          this.job.update({
            ...this.job.data,
            resources: this.pendingHandlers.map((handler) => handler.meta.resource),
            done: this.doneHandlers.map((handler) => handler.meta.resource)
          });
        }
      })
      .then(() => {
        if (isRetry) return;
        if (this.pendingHandlers.length) return this.update(this.pendingHandlers);
        if (this.errors.length)
          throw new ResourceUpdateError(this.errors.map((e) => e.error.message).join(', '));
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
