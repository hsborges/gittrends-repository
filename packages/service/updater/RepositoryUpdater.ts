/*
 *  Author: Hudson S. Borges
 */
import Debug from 'debug';
import { Job } from 'bullmq';
import knex, { Actor, Commit, Milestone } from '@gittrends/database-config';

import Cache from './Cache';
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

export type THandler =
  | 'dependencies'
  | 'issues'
  | 'pull_requests'
  | 'repository'
  | 'releases'
  | 'stargazers'
  | 'tags'
  | 'watchers';

type TJob = { id: string | string[]; resources: string[]; done: string[] };
type TOptions = { job?: Job<TJob>; cache?: Cache };

const debug = Debug('updater:repository-updater');

export default class RepositoryUpdater implements Updater {
  readonly id: string;
  readonly job?: Job<TJob>;
  readonly cache?: Cache;
  readonly handlers: AbstractRepositoryHandler[] = [];

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
    // get components
    const components = (await Promise.all(handlers.map((handler) => handler.component()))).reduce(
      (acc: Component[], result) => acc.concat(result),
      []
    );

    // run queries and update handlers
    await Query.create()
      .compose(...components)
      .then(async ({ data, actors = [], commits = [], milestones = [] }) => {
        actors = actors.filter((actor) => !this.cache?.has(actor));
        commits = commits.filter((commit) => !this.cache?.has(commit));
        milestones = milestones.filter((milestone) => !this.cache?.has(milestone));

        debug(
          `Updating db (actors=${actors.length}; commits=${commits.length}; milestones=${milestones.length}) and ${handlers.length} handlers ...`
        );

        await knex.transaction((trx) =>
          Promise.all([
            Actor.insert(actors, trx).then(() => this.cache?.add(actors)),
            Commit.insert(commits, trx).then(() => this.cache?.add(actors)),
            Milestone.upsert(milestones, trx).then(() => this.cache?.add(milestones)),
            Promise.all(handlers.map((handler) => handler.update(data as TObject, trx)))
          ])
        );
      })
      .catch(async (err) => {
        debug(`Error: ${err.message}`);
        if (err instanceof ValidationError) throw err;
        if (handlers.length === 1) return handlers[0].error(err);
        return Promise.all(
          handlers
            .filter((handler) => handler.hasNextPage())
            .map((handler) => this._update([handler]))
        );
      });
  }

  async update(): Promise<void> {
    while (this.hasNextPage())
      await this._update(this.handlers.filter((handler) => handler.hasNextPage()));
  }

  hasNextPage(): boolean {
    return this.handlers.reduce((acc: boolean, handler) => acc || handler.hasNextPage(), false);
  }
}
