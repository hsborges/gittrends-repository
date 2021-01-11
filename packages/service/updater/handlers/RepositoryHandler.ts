/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';
import { Transaction } from 'knex';
import { Repository, Metadata } from '@gittrends/database-config';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import compact from '../../helpers/compact';

type TObject = Record<string, unknown>;
type TMetadata = { items: unknown[]; hasNextPage: boolean; endCursor?: string };

export default class RepositoryHander extends AbstractRepositoryHandler {
  details?: TObject;
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

  async update(response: Record<string, unknown>, trx: Transaction): Promise<void> {
    if (this.isDone()) return;

    const data = response[this.alias as string];

    if (!this.details) this.details = data as TObject;

    this.languages.items.push(...(get(data, 'languages.edges', []) as []));
    this.topics.items.push(
      ...(get(data, 'repository_topics.nodes', []) as []).map((t: TObject) => t.topic)
    );

    const langPageInfo = get(data, 'languages.page_info', {});
    this.languages.hasNextPage = langPageInfo.has_next_page ?? false;
    this.languages.endCursor = langPageInfo.end_cursor ?? this.languages.endCursor;

    const topicsPageInfo = get(data, 'repository_topics.page_info', {});
    this.topics.hasNextPage = topicsPageInfo.has_next_page ?? false;
    this.topics.endCursor = topicsPageInfo.end_cursor ?? this.topics.endCursor;

    if (this.isDone()) {
      await Promise.all([
        Repository.update(
          compact({
            ...this.details,
            languages: this.languages.items,
            repository_topics: this.topics.items
          }) as TObject,
          trx
        ),
        Metadata.upsert({ ...this.meta, key: 'updatedAt', value: new Date() }, trx)
      ]);
    }
  }

  hasNextPage(): boolean {
    return !this.details || this.languages.hasNextPage || this.topics.hasNextPage;
  }
}
