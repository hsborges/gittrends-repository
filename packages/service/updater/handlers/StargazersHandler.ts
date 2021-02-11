/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';
import { ClientSession } from 'mongodb';
import { Stargazer, Actor, Repository } from '@gittrends/database-config';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import { InternalError, ResourceUpdateError, RetryableError } from '../../helpers/errors';

export default class StargazersHandler extends AbstractRepositoryHandler {
  stargazers: { items: TObject[]; hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'stargazers');
    this.stargazers = { items: [], hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    if (!this.stargazers.endCursor) {
      this.stargazers.endCursor = await Repository.collection
        .findOne({ _id: this.meta.id }, { projection: { _metadata: 1 } })
        .then((result) => result && get(result, ['_metadata', this.meta.resource, 'endCursor']));
    }

    return this._component.includeStargazers(this.stargazers.hasNextPage, {
      first: this.batchSize,
      after: this.stargazers.endCursor,
      alias: 'stargazers'
    });
  }

  async update(response: TObject, session?: ClientSession): Promise<void> {
    if (this.isDone()) return;

    const data = response[this.alias as string];

    this.stargazers.items.push(
      ...get(data, 'stargazers.edges', []).map((stargazer: { user: string; starred_at: Date }) => ({
        repository: this.id,
        ...stargazer
      }))
    );

    const pageInfo = get(data, 'stargazers.page_info', {});
    this.stargazers.hasNextPage = pageInfo.has_next_page ?? false;
    this.stargazers.endCursor = pageInfo.end_cursor ?? this.stargazers.endCursor;

    if (this.stargazers.items.length >= this.writeBatchSize || this.isDone()) {
      await Stargazer.upsert(this.stargazers.items, session);
      await Repository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.endCursor`]: this.stargazers.endCursor } },
        { session }
      );
      this.stargazers.items = [];
    }

    if (this.isDone()) {
      await Repository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.updatedAt`]: new Date() } },
        { session }
      );
    }
  }

  async error(err: Error): Promise<void> {
    if (err instanceof InternalError) {
      const stargazers = get(err, `response.data.${this.alias}.stargazers.edges`, [])
        .map((star: TObject) => ({ repository: this.id, ...star }))
        .filter((star: TObject) => star.starred_at);

      if (stargazers.length) {
        const pageInfo = get(err, `response.data.${this.alias}.stargazers.page_info`);
        this.stargazers.hasNextPage = pageInfo.has_next_page;
        this.stargazers.endCursor = pageInfo.end_cursor || this.stargazers.endCursor;

        await Promise.all([
          Actor.insert(get(err, 'response.actors', [])),
          Stargazer.upsert(stargazers)
        ]);

        await Repository.collection.updateOne(
          { _id: this.meta.id },
          { $set: { [`_metadata.${this.meta.resource}.endCursor`]: this.stargazers.endCursor } }
        );

        return;
      }
    }

    if (err instanceof RetryableError) {
      if (this.batchSize > 1) {
        this.batchSize = Math.floor(this.batchSize / 2);
        return;
      }
    }

    throw new ResourceUpdateError(err.message, err);
  }

  hasNextPage(): boolean {
    return this.stargazers.hasNextPage;
  }
}
