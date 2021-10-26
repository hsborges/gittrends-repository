/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { RepositoryRepository, Tag, TagRepository } from '@gittrends/database-config';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import { ResourceUpdateError } from '../../helpers/errors';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';

export default class TagsHandler extends AbstractRepositoryHandler {
  tags: { items: Tag[]; hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'tags');
    this.tags = { items: [], hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    if (!this.tags.endCursor) {
      this.tags.endCursor = await RepositoryRepository.collection
        .findOne({ _id: this.meta.id }, { projection: { _metadata: 1 } })
        .then((result) => result && get(result, ['_metadata', this.meta.resource, 'endCursor']));
    }

    return this._component.includeTags(this.tags.hasNextPage, {
      first: this.batchSize,
      after: this.tags.endCursor,
      alias: '_tags'
    });
  }

  async update(response: Record<string, unknown>): Promise<void> {
    const data = super.parseResponse(response[this.alias as string]);

    this.tags.items.push(
      ...get<Record<string, unknown>[]>(data, '_tags.nodes', []).map(
        (tag) =>
          new Tag({
            repository: this.id,
            ...((get(tag, 'target.type') === 'Tag' ? tag.target : tag) as Record<string, unknown>)
          })
      )
    );

    const pageInfo = get(data, '_tags.page_info', {});
    this.tags.hasNextPage = pageInfo.has_next_page ?? false;
    this.tags.endCursor = pageInfo.end_cursor ?? this.tags.endCursor;

    if (this.tags.items.length >= this.writeBatchSize || this.isDone()) {
      await Promise.all([super.saveReferences(), TagRepository.upsert(this.tags.items)]);
      await RepositoryRepository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.endCursor`]: this.tags.endCursor } }
      );
      this.tags.items = [];
    }

    if (this.isDone()) {
      await RepositoryRepository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.updatedAt`]: new Date() } }
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
