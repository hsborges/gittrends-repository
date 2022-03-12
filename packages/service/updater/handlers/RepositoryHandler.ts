/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { Repository, Metadata, MongoRepository } from '@gittrends/database';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import { GithubRequestError } from '../../helpers/errors';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';

type TMetadata = { items: unknown[]; hasNextPage: boolean; endCursor?: string };

export default class RepositoryHander extends AbstractRepositoryHandler {
  static resource: string = 'repository';

  private details?: Record<string, unknown>;
  private languagesMeta: TMetadata = { items: [], hasNextPage: true };
  private topicsMeta: TMetadata = { items: [], hasNextPage: true };
  private removed: boolean = false;

  async component(): Promise<RepositoryComponent> {
    return this._component
      .includeDetails(!this.details)
      .includeLanguages(this.languagesMeta.hasNextPage, {
        first: this.batchSize,
        after: this.languagesMeta?.endCursor
      })
      .includeTopics(this.topicsMeta.hasNextPage, {
        first: this.batchSize,
        after: this.topicsMeta?.endCursor
      });
  }

  async update(response: Record<string, unknown>): Promise<void> {
    const data = super.parseResponse(response[this.alias as string]);

    if (!this.details) this.details = data;

    this.languagesMeta.items.push(...get<[]>(data, 'languages.edges', []));
    this.topicsMeta.items.push(
      ...get<[]>(data, 'repository_topics.nodes', []).map((t: Record<string, unknown>) => t.topic)
    );

    const langPageInfo = get(data, 'languages.page_info', {});
    this.languagesMeta.hasNextPage = langPageInfo.has_next_page ?? false;
    this.languagesMeta.endCursor = langPageInfo.end_cursor ?? this.languagesMeta.endCursor;

    const topicsPageInfo = get(data, 'repository_topics.page_info', {});
    this.topicsMeta.hasNextPage = topicsPageInfo.has_next_page ?? false;
    this.topicsMeta.endCursor = topicsPageInfo.end_cursor ?? this.topicsMeta.endCursor;

    if (this.isDone()) {
      this.entityStorage.add(
        new Repository({
          ...this.details,
          languages: this.languagesMeta.items,
          repository_topics: this.topicsMeta.items
        })
      );

      await Promise.all([
        this.entityStorage.persist(),
        MongoRepository.get(Metadata).collection.updateOne(
          { _id: this.id },
          { $set: { 'repository.updatedAt': new Date() } },
          { upsert: true }
        )
      ]);
    }
  }

  async error(err: Error): Promise<void> {
    if (err instanceof GithubRequestError && err.is('NOT_FOUND')) {
      this.removed = true;
      await MongoRepository.get(Metadata).collection.updateOne(
        { _id: this.id },
        { $set: { removed: true, removedAt: new Date() } },
        { upsert: true }
      );
      return;
    }

    return super.error(err);
  }

  hasNextPage(): boolean {
    return (
      !this.removed &&
      (!this.details || this.languagesMeta.hasNextPage || this.topicsMeta.hasNextPage)
    );
  }
}
