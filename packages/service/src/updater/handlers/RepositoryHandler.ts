/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';
import { Transaction } from 'knex';
import { Repository, Metadata } from '@gittrends/database-config';

import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import compact from '../../helpers/compact';

type TObject = Record<string, unknown>;
type TMetadata = { items: unknown[]; hasNextPage: boolean; endCursor?: string };

export default class RepositoryDetailsHander extends AbstractRepositoryHandler {
  details?: TObject;
  languages: TMetadata;
  topics: TMetadata;

  constructor(id: string, alias?: string) {
    super(id, alias, 'repository');
    this.languages = { items: [], hasNextPage: true };
    this.topics = { items: [], hasNextPage: true };
  }

  async updateComponent(): Promise<void> {
    this.component
      .includeDetails(this.details === undefined)
      .includeLanguages(this.languages.hasNextPage, {
        first: this.batchSize,
        after: this.languages?.endCursor
      })
      .includeTopics(this.topics.hasNextPage, {
        first: this.batchSize,
        after: this.topics?.endCursor
      });
  }

  async updateDatabase(response: Record<string, unknown>, trx: Transaction): Promise<void> {
    if (this.done) return;

    const data = response[this.alias] as TObject;

    if (this.details === undefined) this.details = data;

    this.languages.items.push(...(get(data, 'languages.edges', []) as []));
    this.topics.items.push(
      ...(get(data, 'repository_topics.nodes', []) as []).map((t: TObject) => t.topic)
    );

    const langPageInfo = 'languages.page_info';
    this.languages.hasNextPage = get(data, `${langPageInfo}.has_next_page`, false) as boolean;
    this.languages.endCursor = get(data, `${langPageInfo}.end_cursor`) as string | undefined;

    const topicsPageInfo = 'repository_topics.page_info';
    this.topics.hasNextPage = get(data, `${topicsPageInfo}.has_next_page`, false) as boolean;
    this.topics.endCursor = get(data, `${topicsPageInfo}.end_cursor`) as string | undefined;

    if (this.done) {
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

  async error(error: Error): Promise<void> {
    throw error;
  }

  get hasNextPage(): boolean {
    return !this.details || this.languages.hasNextPage || this.topics.hasNextPage;
  }
}
