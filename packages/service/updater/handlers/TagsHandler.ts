/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';
import { ClientSession } from 'mongodb';
import { Repository, Tag } from '@gittrends/database-config';

import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import RepositoryComponent from '../../github/components/RepositoryComponent';
import { ResourceUpdateError } from '../../helpers/errors';

export default class TagsHandler extends AbstractRepositoryHandler {
  tags: { items: TObject[]; hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'tags');
    this.tags = { items: [], hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    if (!this.tags.endCursor) {
      this.tags.endCursor = await Repository.collection
        .findOne({ _id: this.meta.id }, { projection: { _metadata: 1 } })
        .then((result) => result && get(result, ['_metadata', this.meta.resource, 'endCursor']));
    }

    return this._component.includeTags(this.tags.hasNextPage, {
      first: this.batchSize,
      after: this.tags.endCursor,
      alias: '_tags'
    });
  }

  async update(response: TObject, session?: ClientSession): Promise<void> {
    const data = super.parseResponse(response[this.alias as string]);

    this.tags.items.push(
      ...get(data, '_tags.nodes', []).map((tag: TObject) => ({
        repository: this.id,
        ...((get(tag, 'target.type') === 'Tag' ? tag.target : tag) as TObject)
      }))
    );

    const pageInfo = get(data, '_tags.page_info', {});
    this.tags.hasNextPage = pageInfo.has_next_page ?? false;
    this.tags.endCursor = pageInfo.end_cursor ?? this.tags.endCursor;

    if (this.tags.items.length >= this.writeBatchSize || this.isDone()) {
      await super.saveReferences(session);
      await Tag.upsert(this.tags.items, session);
      await Repository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.endCursor`]: this.tags.endCursor } },
        { session }
      );
      this.tags.items = [];
    }

    if (this.isDone()) {
      await Repository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.updatedAt`]: new Date() } },
        { session }
      );
    }
  }

  async error(err: Error): Promise<void> {
    throw new ResourceUpdateError(err.message, err);
  }

  hasNextPage(): boolean {
    return this.tags.hasNextPage;
  }
}
