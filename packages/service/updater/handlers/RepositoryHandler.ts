/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';
import { ClientSession } from 'mongodb';
import { Repository } from '@gittrends/database-config';

import compact from '../../helpers/compact';
import RepositoryComponent from '../../github/components/RepositoryComponent';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import { ResourceUpdateError } from '../../helpers/errors';

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

  async update(response: Record<string, unknown>, session?: ClientSession): Promise<void> {
    if (this.isDone()) return;

    const data = super.parseResponse(response[this.alias as string]);

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
      const current = await Repository.collection.findOne(
        { _id: this.id },
        { projection: { _metadata: 1 }, session }
      );

      await super.saveReferences(session).then(() =>
        Repository.upsert(
          compact({
            ...this.details,
            languages: this.languages.items,
            repository_topics: this.topics.items,
            _metadata: { ...current._metadata, [this.meta.resource]: { updatedAt: new Date() } }
          }) as TObject,
          session
        )
      );
    }
  }

  async error(err: Error): Promise<void> {
    throw new ResourceUpdateError(err.message, err);
  }

  hasNextPage(): boolean {
    return !this.details || this.languages.hasNextPage || this.topics.hasNextPage;
  }
}
