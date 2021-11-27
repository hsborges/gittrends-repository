/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { Watcher, MongoRepository, Repository } from '@gittrends/database-config';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';

export default class WatchersHandler extends AbstractRepositoryHandler {
  watchers: { items: Watcher[]; hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'watchers');
    this.watchers = { items: [], hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    if (!this.watchers.endCursor) {
      this.watchers.endCursor = await MongoRepository.get(Repository)
        .collection.findOne({ _id: this.meta.id }, { projection: { _metadata: 1 } })
        .then((result) => result && get(result, ['_metadata', this.meta.resource, 'endCursor']));
    }

    return this._component.includeWatchers(this.watchers.hasNextPage, {
      first: this.batchSize,
      after: this.watchers.endCursor,
      alias: '_watchers'
    });
  }

  async update(response: Record<string, unknown>): Promise<void> {
    const data = super.parseResponse(response[this.alias as string]);

    this.watchers.items.push(
      ...get<string[]>(data, '_watchers.nodes', []).map(
        (watcher) => new Watcher({ repository: this.id, user: watcher })
      )
    );

    const pageInfo = get(data, '_watchers.page_info', {});
    this.watchers.hasNextPage = pageInfo.has_next_page ?? false;
    this.watchers.endCursor = pageInfo.end_cursor ?? this.watchers.endCursor;

    if (this.watchers.items.length >= this.writeBatchSize || this.isDone()) {
      await Promise.all([
        super.saveReferences(),
        MongoRepository.get(Watcher).upsert(this.watchers.items)
      ]);
      await MongoRepository.get(Repository).collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.endCursor`]: this.watchers.endCursor } }
      );
      this.watchers.items = [];
    }

    if (this.isDone()) {
      await MongoRepository.get(Repository).collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.updatedAt`]: new Date() } }
      );
    }
  }

  hasNextPage(): boolean {
    return this.watchers.hasNextPage;
  }
}
