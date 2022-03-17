/*
 *  Author: Hudson S. Borges
 */
import crypto from 'crypto';
import EventEmitter from 'events';
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

type RepositoryUpdaterOpts = {
  cache?: Cache;
  batchSize?: number;
  writeBatchSize?: number;
};

export class RepositoryUpdater extends EventEmitter implements Updater {
  private readonly id: string;
  private readonly httpClient: HttpClient;

  private readonly handlers: AbstractRepositoryHandler[] = [];
  private readonly errors: { handler: AbstractRepositoryHandler; error: Error }[] = [];

  constructor(
    repositoryId: string,
    handlers: RepositoryUpdaterHandler[],
    httpClient: HttpClient,
    opts?: RepositoryUpdaterOpts
  ) {
    super();

    const { cache, batchSize, writeBatchSize } = opts || {};

    this.id = repositoryId;
    this.httpClient = httpClient;

    handlers.forEach((resource) => {
      const Class = handlersList.find((handler) => handler.resource === resource);
      if (!Class) throw new Error(`Handler for '${resource}' not found!`);
      this.handlers.push(new Class(this.id, { cache, batchSize, writeBatchSize }));
    });
  }

  async update(handlers = this.filterPending(this.handlers), isRetry?: boolean): Promise<void> {
    let pendingHandlers = handlers;
    if (pendingHandlers.length === 0) return;

    let hash: string;
    let hashCount: number = 0;

    do {
      await Query.create(this.httpClient)
        .compose(
          ...flatten(await Promise.all(pendingHandlers.map((handler) => handler.component())))
        )
        .run((query) => {
          const queryHash = crypto.createHash('sha256').update(query).digest('hex');
          hashCount = hash !== queryHash ? 0 : hashCount + 1;
          if (hashCount >= 3) throw new Error('Potential loop detected!');
          hash = queryHash;
          return query;
        })
        .then(async (data) => {
          for (const handler of pendingHandlers) await handler.update(data);
        })
        .catch(async (err) => {
          if (isRetry || !(err instanceof RequestError)) throw err;

          const errorHandler = (err: Error, handler: AbstractRepositoryHandler) =>
            handler.error(err).catch((err2) => this.errors.push({ handler, error: err2 }));

          if (pendingHandlers.length === 1) return errorHandler(err, pendingHandlers[0]);

          return Promise.all(
            pendingHandlers.map((handler) =>
              this.update([handler], true).catch((err) => errorHandler(err, handler))
            )
          );
        })
        .finally(() => {
          if (isRetry) return;

          if (this.filterDone(pendingHandlers).length > 0) {
            const errors = this.errors.map(
              (e) => (e.handler.constructor as typeof AbstractRepositoryHandler).resource
            );

            const done = this.filterDone(handlers).map(
              (h) => (h.constructor as typeof AbstractRepositoryHandler).resource
            );

            const pending = this.filterPending(handlers).map(
              (h) => (h.constructor as typeof AbstractRepositoryHandler).resource
            );

            this.emit('progress', { pending, done: difference(done, errors), errors });
          }
        });

      pendingHandlers = this.filterPending(pendingHandlers);
    } while (!isRetry && pendingHandlers.length > 0);

    if (!isRetry) {
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
