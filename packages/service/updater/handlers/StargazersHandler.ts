/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { RepositoryRepository, Stargazer, StargazerRepository } from '@gittrends/database-config';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import { InternalError, RetryableError } from '../../helpers/errors';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';

export default class StargazersHandler extends AbstractRepositoryHandler {
  stargazers: { items: Stargazer[]; hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'stargazers');
    this.stargazers = { items: [], hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    if (!this.stargazers.endCursor) {
      this.stargazers.endCursor = await RepositoryRepository.collection
        .findOne({ _id: this.meta.id }, { projection: { _metadata: 1 } })
        .then((result) => result && get(result, ['_metadata', this.meta.resource, 'endCursor']));
    }

    return this._component.includeStargazers(this.stargazers.hasNextPage, {
      first: this.batchSize,
      after: this.stargazers.endCursor,
      alias: '_stargazers'
    });
  }

  async update(response: Record<string, unknown>): Promise<void> {
    return this._update(response).finally(
      () => (this.batchSize = Math.min(this.defaultBatchSize, this.batchSize * 2))
    );
  }

  private async _update(response: Record<string, unknown>): Promise<void> {
    const data = super.parseResponse(response[this.alias as string]);

    this.stargazers.items.push(
      ...get<{ user: string; starred_at: Date }[]>(data, '_stargazers.edges', []).map(
        (stargazer) => new Stargazer({ repository: this.id, ...stargazer })
      )
    );

    const pageInfo = get(data, '_stargazers.page_info', {});
    this.stargazers.hasNextPage = pageInfo.has_next_page ?? false;
    this.stargazers.endCursor = pageInfo.end_cursor ?? this.stargazers.endCursor;

    if (this.stargazers.items.length >= this.writeBatchSize || this.isDone()) {
      await Promise.all([
        super.saveReferences(),
        StargazerRepository.upsert(this.stargazers.items)
      ]);
      await RepositoryRepository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.endCursor`]: this.stargazers.endCursor } }
      );
      this.stargazers.items = [];
    }

    if (this.isDone()) {
      await RepositoryRepository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.updatedAt`]: new Date() } }
      );
    }
  }

  async error(err: Error): Promise<void> {
    if (err instanceof InternalError) {
      const data = super.parseResponse(get(err, `response.data.${this.alias as string}`));

      this.stargazers.items.push(
        ...get(data, '_stargazers.edges', [])
          .filter((star: Record<string, unknown>) => star && star.starred_at)
          .map((star: Record<string, unknown>) => ({ repository: this.id, ...star }))
      );

      const pageInfo = get(data, '_stargazers.page_info');
      this.stargazers.endCursor = pageInfo.end_cursor ?? this.stargazers.endCursor;

      return;
    }

    if (err instanceof RetryableError) {
      if (this.batchSize > 1) {
        this.batchSize = 1;
        return;
      }
    }

    return super.error(err);
  }

  hasNextPage(): boolean {
    return this.stargazers.hasNextPage;
  }
}
