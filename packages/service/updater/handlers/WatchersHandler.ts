/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { Watcher, MongoRepository, Repository } from '@gittrends/database-config';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';

export default class WatchersHandler extends AbstractRepositoryHandler {
  static resource: string = 'watchers';

  meta: { hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias);
    this.meta = { hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    if (!this.meta.endCursor) {
      this.meta.endCursor = await MongoRepository.get(Repository)
        .collection.findOne({ _id: this.id }, { projection: { _metadata: 1 } })
        .then((res) => res && get(res, `_metadata.${WatchersHandler.resource}.endCursor`));
    }

    return this._component.includeWatchers(this.meta.hasNextPage, {
      first: this.batchSize,
      after: this.meta.endCursor,
      alias: '_watchers'
    });
  }

  async update(response: Record<string, unknown>): Promise<void> {
    const data = super.parseResponse(response[this.alias as string]);

    const pageInfo = get(data, '_watchers.page_info', {});
    this.meta.hasNextPage = pageInfo.has_next_page ?? false;
    this.meta.endCursor = pageInfo.end_cursor ?? this.meta.endCursor;

    await Promise.all([
      super.saveReferences(),
      MongoRepository.get(Watcher).upsert(
        get<string[]>(data, '_watchers.nodes', []).map(
          (watcher) => new Watcher({ repository: this.id, user: watcher })
        )
      )
    ]);

    await MongoRepository.get(Repository).collection.updateOne(
      { _id: this.id },
      { $set: { [`_metadata.${WatchersHandler.resource}.endCursor`]: this.meta.endCursor } }
    );

    if (this.isDone()) {
      await MongoRepository.get(Repository).collection.updateOne(
        { _id: this.id },
        { $set: { [`_metadata.${WatchersHandler.resource}.updatedAt`]: new Date() } }
      );
    }
  }

  hasNextPage(): boolean {
    return this.meta.hasNextPage;
  }
}
