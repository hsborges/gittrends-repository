/*
 *  Author: Hudson S. Borges
 */
import { Job } from 'bull';
import { flatten, shuffle, truncate } from 'lodash';
import { map } from 'bluebird';

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
    if (handlers.length === 0) return;

    return Query.create()
      .compose(...flatten(await Promise.all(handlers.map((handler) => handler.component()))))
      .run()
      .then((data) => Promise.all(handlers.map((handler) => handler.update(data))))
      .catch(async (err) => {
        if (isRetry || err instanceof ValidationError) throw err;

        return map(shuffle(handlers), (handler) =>
          this.update([handler], true).catch((err) =>
            handler.error(err).catch((err2) => this.errors.push({ handler, error: err2 }))
          )
        );
      })
      .finally(async () => {
        if (isRetry) return;
        if (this.job && handlers.find((h) => h.isDone())) {
          this.job?.progress(Math.ceil((this.doneHandlers.length / this.handlers.length) * 100));

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
        if (this.errors.length === 1) {
          throw new ResourceUpdateError(
            truncate(this.errors[0].error.message, { length: 144 }),
            this.errors[0].error
          );
        }
        if (this.errors.length > 1) {
          const error = new ResourceUpdateError(
            JSON.stringify(
              this.errors.reduce(
                (m, e) => ({
                  ...m,
                  [e.handler.constructor.name]: truncate(e.error.message, { length: 144 })
                }),
                {}
              )
            )
          );

          error.stack = this.errors
            .map((error) => `From previous error: ${error.error.stack}`)
            .join('\n');

          throw error;
        }
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
