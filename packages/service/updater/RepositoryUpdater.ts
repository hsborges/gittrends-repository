/*
 *  Author: Hudson S. Borges
 */
import { Job } from 'bullmq';
import crypto from 'crypto';
import { difference, flatten } from 'lodash';

import HttpClient from '../github/HttpClient';
import Query from '../github/Query';
import { RepositoryUpdateError, RequestError } from '../helpers/errors';
import { Cache } from './Cache';
import AbstractRepositoryHandler from './handlers/AbstractRepositoryHandler';
import DependenciesHandler from './handlers/DependenciesHandler';
import IssuesHander, { PullRequestHander } from './handlers/IssueHandler';
import ReleasesHandler from './handlers/ReleasesHandler';
import RepositoryHander from './handlers/RepositoryHandler';
import StargazersHandler from './handlers/StargazersHandler';
import TagsHandler from './handlers/TagsHandler';
import WatchersHandler from './handlers/WatchersHandler';
import Updater from './Updater';

const handlersList = [
  DependenciesHandler,
  IssuesHander,
  PullRequestHander,
  RepositoryHander,
  ReleasesHandler,
  StargazersHandler,
  TagsHandler,
  WatchersHandler
];

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

export class RepositoryUpdater implements Updater {
  private readonly id: string;
  private readonly httpClient: HttpClient;

  private readonly job?: Job<RepositoryUpdaterJob>;
  private readonly handlers: AbstractRepositoryHandler[] = [];
  private readonly errors: { handler: AbstractRepositoryHandler; error: Error }[] = [];

  constructor(
    repositoryId: string,
    handlers: RepositoryUpdaterHandler[],
    httpClient: HttpClient,
    opts: { job?: Job<RepositoryUpdaterJob>; cache?: Cache } = {}
  ) {
    this.id = repositoryId;
    this.httpClient = httpClient;
    this.job = opts?.job;

    handlers.forEach((resource) => {
      const Class = handlersList.find((handler) => handler.resource === resource);
      if (!Class) throw new Error(`Handler for '${resource}' not found!`);
      this.handlers.push(new Class(this.id, { cache: opts?.cache }));
    });
  }

  async update(handlers = this.filterPending(this.handlers), isRetry?: boolean): Promise<void> {
    if (!isRetry) {
      this.job?.log(
        `[${new Date().toISOString()}]: updater started (resources: ${handlers
          .map((h) => (h.constructor as typeof AbstractRepositoryHandler).resource)
          .join(', ')}).`
      );
    }

    let pendingHandlers = handlers;
    if (pendingHandlers.length === 0) return;

    let hash: string;

    do {
      await Query.create(this.httpClient)
        .compose(
          ...flatten(await Promise.all(pendingHandlers.map((handler) => handler.component())))
        )
        .run((query) => {
          const queryHash = crypto.createHash('sha256').update(query).digest('hex');
          if (hash === queryHash) throw new Error('Potential loop detected!');
          hash = queryHash;
          return query;
        })
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
            const errors = this.errors.map(
              (e) => (e.handler.constructor as typeof AbstractRepositoryHandler).resource
            );

            const done = this.filterDone(handlers).map(
              (h) => (h.constructor as typeof AbstractRepositoryHandler).resource
            );

            const pending = this.filterPending(handlers).map(
              (h) => (h.constructor as typeof AbstractRepositoryHandler).resource
            );

            this.job?.updateProgress({ pending, done: difference(done, errors), errors });
            this.job?.log(
              `[${new Date().toISOString()}]: resource(s) updated (resources: ${this.filterDone(
                pendingHandlers
              )
                .map((h) => (h.constructor as typeof AbstractRepositoryHandler).resource)
                .join(', ')}).`
            );
          }
        });

      pendingHandlers = this.filterPending(pendingHandlers);
    } while (!isRetry && pendingHandlers.length > 0);

    if (!isRetry) {
      this.job?.log(`[${new Date().toISOString()}]: updater finished.`);
      if (this.errors.length > 0) throw new RepositoryUpdateError(this.errors.map((e) => e.error));
    }
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
