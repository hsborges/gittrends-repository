import { get } from 'lodash';
import { Transaction } from 'knex';
import { Metadata, IMetadata, Tag } from '@gittrends/database-config';

import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import RepositoryComponent from '../../github/components/RepositoryComponent';

export default class TagsHandler extends AbstractRepositoryHandler {
  tags: { hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'tags');
    this.tags = { hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    if (!this.tags.endCursor) {
      this.tags.endCursor = await Metadata.query()
        .where({ ...this.meta, key: 'endCursor' })
        .first<IMetadata>()
        .then((result) => result && result.value);
    }

    return this._component.includeTags(this.tags.hasNextPage, {
      first: this.batchSize,
      after: this.tags.endCursor,
      alias: 'tags'
    });
  }

  async update(response: TObject, trx: Transaction): Promise<void> {
    if (this.done) return;

    const data = response[this.alias as string];

    const tags = get(data, 'tags.nodes', []).map((tag: TObject) => ({
      repository: this.id,
      ...((get(tag, 'target.type') === 'Tag' ? tag.target : tag) as TObject)
    }));

    const pageInfo = get(data, 'tags.page_info', {});
    this.tags.hasNextPage = pageInfo.has_next_page || false;
    this.tags.endCursor = pageInfo.end_cursor || this.tags.endCursor;

    await Promise.all([
      Tag.insert(tags, trx),
      Metadata.upsert({ ...this.meta, key: 'endCursor', value: this.tags.endCursor })
    ]);

    if (this.done) {
      await Metadata.upsert({ ...this.meta, key: 'updatedAt', value: new Date() });
    }
  }

  get hasNextPage(): boolean {
    return this.tags.hasNextPage;
  }
}
