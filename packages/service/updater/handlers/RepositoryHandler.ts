/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { Repository, MongoRepository } from '@gittrends/database';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import { NotFoundError } from '../../helpers/errors';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';

type TMetadata = { items: unknown[]; hasNextPage: boolean; endCursor?: string };

export default class RepositoryHander extends AbstractRepositoryHandler {
  static resource: string = 'repository';

  private details?: Record<string, unknown>;
  private languagesMeta: TMetadata = { items: [], hasNextPage: true };
  private topicsMeta: TMetadata = { items: [], hasNextPage: true };

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
      const current = await MongoRepository.get(Repository).collection.findOne(
        { _id: this.id },
        { projection: { _metadata: 1 } }
      );

      await super.saveReferences().then(() =>
        MongoRepository.get(Repository).upsert(
          new Repository({
            ...this.details,
            languages: this.languagesMeta.items,
            repository_topics: this.topicsMeta.items,
            _metadata: { ...current?._metadata, repository: { updatedAt: new Date() } }
          })
        )
      );
    }
  }

  async error(err: Error): Promise<void> {
    if (err instanceof NotFoundError) {
      await MongoRepository.get(Repository).collection.updateOne(
        { _id: this.id },
        { $set: { '_metadata.removed': true, '_metadata.removed_at': new Date() } }
      );
      return;
    }

    return super.error(err);
  }

  hasNextPage(): boolean {
    return !this.details || this.languagesMeta.hasNextPage || this.topicsMeta.hasNextPage;
  }
}
