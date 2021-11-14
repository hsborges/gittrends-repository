/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { Repository, RepositoryRepository } from '@gittrends/database-config';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import { NotFoundError } from '../../helpers/errors';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';

type TMetadata = { items: unknown[]; hasNextPage: boolean; endCursor?: string };

export default class RepositoryHander extends AbstractRepositoryHandler {
  details?: Record<string, unknown>;
  languages: TMetadata;
  topics: TMetadata;

  constructor(id: string, alias?: string) {
    super(id, alias, 'repository');
    this.languages = { items: [], hasNextPage: true };
    this.topics = { items: [], hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    return this._component
      .includeDetails(!this.details)
      .includeLanguages(this.languages.hasNextPage, {
        first: this.batchSize,
        after: this.languages?.endCursor
      })
      .includeTopics(this.topics.hasNextPage, {
        first: this.batchSize,
        after: this.topics?.endCursor
      });
  }

  async update(response: Record<string, unknown>): Promise<void> {
    const data = super.parseResponse(response[this.alias as string]);

    if (!this.details) this.details = data;

    this.languages.items.push(...get<[]>(data, 'languages.edges', []));
    this.topics.items.push(
      ...get<[]>(data, 'repository_topics.nodes', []).map((t: Record<string, unknown>) => t.topic)
    );

    const langPageInfo = get(data, 'languages.page_info', {});
    this.languages.hasNextPage = langPageInfo.has_next_page ?? false;
    this.languages.endCursor = langPageInfo.end_cursor ?? this.languages.endCursor;

    const topicsPageInfo = get(data, 'repository_topics.page_info', {});
    this.topics.hasNextPage = topicsPageInfo.has_next_page ?? false;
    this.topics.endCursor = topicsPageInfo.end_cursor ?? this.topics.endCursor;

    if (this.isDone()) {
      const current = await RepositoryRepository.collection.findOne(
        { _id: this.id },
        { projection: { _metadata: 1 } }
      );

      await super.saveReferences().then(() =>
        RepositoryRepository.upsert(
          new Repository({
            ...this.details,
            languages: this.languages.items,
            repository_topics: this.topics.items,
            _metadata: { ...current?._metadata, [this.meta.resource]: { updatedAt: new Date() } }
          })
        )
      );
    }
  }

  async error(err: Error): Promise<void> {
    if (err instanceof NotFoundError) {
      await RepositoryRepository.collection.updateOne(
        { _id: this.id },
        { $set: { '_metadata.removed': true, '_metadata.removed_at': new Date() } }
      );
      return;
    }

    throw err;
  }

  hasNextPage(): boolean {
    return !this.details || this.languages.hasNextPage || this.topics.hasNextPage;
  }
}
