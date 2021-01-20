/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';
import { Transaction } from 'knex';
import { Metadata, Tag } from '@gittrends/database-config';

import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import RepositoryComponent from '../../github/components/RepositoryComponent';

export default class TagsHandler extends AbstractRepositoryHandler {
  tags: { items: TObject[]; hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'tags');
    this.tags = { items: [], hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    if (!this.tags.endCursor) {
      this.tags.endCursor = await Metadata.query()
        .where({ ...this.meta, key: 'endCursor' })
        .first()
        .then((result) => result && result.value);
    }

    return this._component.includeTags(this.tags.hasNextPage, {
      first: this.batchSize,
      after: this.tags.endCursor,
      alias: 'tags'
    });
  }

  async update(response: TObject, trx: Transaction): Promise<void> {
    if (this.isDone()) return;

    const data = response[this.alias as string];

    this.tags.items.push(
      ...get(data, 'tags.nodes', []).map((tag: TObject) => ({
        repository: this.id,
        ...((get(tag, 'target.type') === 'Tag' ? tag.target : tag) as TObject)
      }))
    );

    const pageInfo = get(data, 'tags.page_info', {});
    this.tags.hasNextPage = pageInfo.has_next_page ?? false;
    this.tags.endCursor = pageInfo.end_cursor ?? this.tags.endCursor;

    if (this.tags.items.length >= this.writeBatchSize || this.isDone()) {
      await Promise.all([
        Tag.insert(this.tags.items, trx),
        Metadata.upsert({ ...this.meta, key: 'endCursor', value: this.tags.endCursor }, trx)
      ]);
      this.tags.items = [];
    }

    if (this.isDone()) {
      await Metadata.upsert({ ...this.meta, key: 'updatedAt', value: new Date() });
    }
  }

  hasNextPage(): boolean {
    return this.tags.hasNextPage;
  }
}
