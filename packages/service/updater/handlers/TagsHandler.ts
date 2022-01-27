/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { Tag, MongoRepository, Repository } from '@gittrends/database';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';

export default class TagsHandler extends AbstractRepositoryHandler {
  static resource: string = 'tags';

  private meta: { hasNextPage: boolean; endCursor?: string } = { hasNextPage: true };

  async component(): Promise<RepositoryComponent> {
    if (!this.meta.endCursor) {
      this.meta.endCursor = await MongoRepository.get(Repository)
        .collection.findOne({ _id: this.id }, { projection: { _metadata: 1 } })
        .then((res) => res && get(res, `_metadata.${TagsHandler.resource}.endCursor`));
    }

    return this._component.includeTags(this.meta.hasNextPage, {
      first: this.batchSize,
      after: this.meta.endCursor,
      alias: '_tags'
    });
  }

  async update(response: Record<string, unknown>): Promise<void> {
    const data = super.parseResponse(response[this.alias as string]);

    const pageInfo = get(data, '_tags.page_info', {});
    this.meta.hasNextPage = pageInfo.has_next_page ?? false;
    this.meta.endCursor = pageInfo.end_cursor ?? this.meta.endCursor;

    this.entityStorage.add(
      get<Record<string, unknown>[]>(data, '_tags.nodes', []).map(
        (tag) =>
          new Tag({
            repository: this.id,
            ...((get(tag, 'target.type') === 'Tag' ? tag.target : tag) as Record<string, unknown>)
          })
      )
    );

    if (this.entityStorage.size(Tag) >= 1000 || this.isDone()) {
      await this.entityStorage
        .persist()
        .then(() =>
          MongoRepository.get(Repository).collection.updateOne(
            { _id: this.id },
            { $set: { [`_metadata.${TagsHandler.resource}.endCursor`]: this.meta.endCursor } }
          )
        );
    }

    if (this.isDone()) {
      await MongoRepository.get(Repository).collection.updateOne(
        { _id: this.id },
        { $set: { [`_metadata.${TagsHandler.resource}.updatedAt`]: new Date() } }
      );
    }
  }

  hasNextPage(): boolean {
    return this.meta.hasNextPage;
  }
}
