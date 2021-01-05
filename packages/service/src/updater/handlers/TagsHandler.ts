import { get } from 'lodash';
import { Transaction } from 'knex';
import { Metadata, IMetadata, Tag } from '@gittrends/database-config';

import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import { ResourceUpdateError } from '../../helpers/errors';

export default class TagsHandler extends AbstractRepositoryHandler {
  tags: { hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'tags');
    this.tags = { hasNextPage: true };
  }

  async updateComponent(): Promise<void> {
    if (!this.tags.endCursor) {
      this.tags.endCursor = await Metadata.query()
        .where({ ...this.meta, key: 'endCursor' })
        .first<IMetadata>()
        .then((result) => result && result.value);
    }

    this.component.includeTags(this.tags.hasNextPage, {
      first: this.batchSize,
      after: this.tags.endCursor,
      alias: 'tags'
    });
  }

  async updateDatabase(response: TObject, trx: Transaction): Promise<void> {
    if (this.done) return;

    const data = response[this.alias];

    const tags = get(data, 'tags.nodes', []).map((tag: TObject) => ({
      repository: this.component.id,
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

  async error(err: Error): Promise<void> {
    throw new ResourceUpdateError(err.message, err);
  }

  get hasNextPage(): boolean {
    return this.tags.hasNextPage;
  }
}
