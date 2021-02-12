/*
 *  Author: Hudson S. Borges
 */
import { Job } from 'bullmq';
import { all, each, map } from 'bluebird';
import { flatten } from 'lodash';
import { Actor, Commit, Milestone } from '@gittrends/database-config';

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
  readonly cache?: Cache;
  readonly handlers: AbstractRepositoryHandler[] = [];
  readonly errors: { handler: AbstractRepositoryHandler; error: Error }[] = [];

  constructor(repositoryId: string, handlers: THandler[], opts?: TOptions) {
    this.id = repositoryId;
    this.job = opts?.job;
    this.cache = opts?.cache;
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
    // run queries and update handlers
    await Query.create()
      .compose(...flatten(await map(handlers, (handler) => handler.component())))
      .run()
      .then(async ({ data, actors = [], commits = [], milestones = [] }) => {
        actors = actors.filter((actor) => !this.cache?.has(actor));
        commits = commits.filter((commit) => !this.cache?.has(commit));
        milestones = milestones.filter((milestone) => !this.cache?.has(milestone));

        await all([
          Actor.insert(actors).then(() => this.cache?.add(actors)),
          Commit.upsert(commits).then(() => this.cache?.add(commits)),
          Milestone.upsert(milestones).then(() => this.cache?.add(milestones))
        ]).then(() => all(handlers.map(async (handler) => handler.update(data as TObject))));

        const doneHandlers = handlers.filter((handler) =>
          this.job && handler.isDone() ? true : false
        );

        if (this.job && doneHandlers.length) {
          const totalDone = this.handlers.reduce((acc: number, h) => acc + (h.isDone() ? 1 : 0), 0);
          const resourcesDone = this.pendingHandlers().map((handler) => handler.meta.resource);
          this.job.updateProgress(Math.ceil((totalDone / this.handlers.length) * 100));
          this.job.update({
            ...this.job.data,
            resources: this.handlers
              .map((handler) => handler.meta.resource)
              .filter((resource) => resourcesDone.indexOf(resource) < 0),
            done: resourcesDone
          });
        }
      })
      .catch(async (err) => {
        if (err instanceof ValidationError) throw err;

        if (handlers.length === 1) {
          return handlers[0].error(err).catch((err2) => {
            this.errors.push({ handler: handlers[0], error: err2 });
            this.job?.update({
              ...this.job.data,
              resources: this.job.data.resources.filter((r) => r !== handlers[0].meta.resource),
              errors: [...(this.job.data.errors || []), handlers[0].meta.resource]
            });
            return Promise.resolve();
          });
        }

        return each(
          handlers.filter((handler) => handler.hasNextPage()),
          (handler) => this._update([handler])
        );
      });
  }

  async update(): Promise<void> {
    while (this.pendingHandlers().length > 0) await this._update(this.pendingHandlers());

    if (this.errors.length)
      throw new ResourceUpdateError(this.errors.map((e) => e.error.message).join(', '));
  }

  private pendingHandlers(): AbstractRepositoryHandler[] {
    return this.handlers.filter(
      (handler) => handler.hasNextPage() && this.errors.findIndex((e) => e.handler === handler) < 0
    );
  }
}
