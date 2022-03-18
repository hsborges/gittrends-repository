/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { Watcher, MongoRepository, Metadata } from '@gittrends/database';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';

export default class WatchersHandler extends AbstractRepositoryHandler {
  static resource: string = 'watchers';

  private meta: { hasNextPage: boolean; endCursor?: string } = { hasNextPage: true };

  async component(): Promise<RepositoryComponent> {
    if (!this.meta.endCursor) {
      this.meta.endCursor = await MongoRepository.get(Metadata)
        .collection.findOne({ _id: this.id })
        .then((res) => res && get(res, `${WatchersHandler.resource}.endCursor`));
    }

    return this._component.includeWatchers(this.meta.hasNextPage, {
      first: this.batchSize,
      after: this.meta.endCursor
    });
  }

  async collect(response: Record<string, unknown>): Promise<void> {
    const data = super.parseResponse(response[this.alias as string]);

    const pageInfo = get(data, '_watchers.page_info', {});
    this.meta.hasNextPage = pageInfo.has_next_page ?? false;
    this.meta.endCursor = pageInfo.end_cursor ?? this.meta.endCursor;

    this.entityStorage.add(
      get<string[]>(data, '_watchers.nodes', []).map(
        (watcher) => new Watcher({ repository: this.id, user: watcher })
      )
    );

    if (this.entityStorage.size() >= this.writeBatchSize || this.isDone()) {
      await this.entityStorage.persist();
      await MongoRepository.get(Metadata).collection.updateOne(
        { _id: this.id },
        { $set: { [`${WatchersHandler.resource}.endCursor`]: this.meta.endCursor } },
        { upsert: true }
      );
    }

    if (this.isDone()) {
      await MongoRepository.get(Metadata).collection.updateOne(
        { _id: this.id },
        { $set: { [`${WatchersHandler.resource}.updatedAt`]: new Date() } },
        { upsert: true }
      );
    }
  }

  hasNextPage(): boolean {
    return this.meta.hasNextPage;
  }
}
