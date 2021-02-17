/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';
import { ClientSession } from 'mongodb';
import { Repository, Watcher } from '@gittrends/database-config';

import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import RepositoryComponent from '../../github/components/RepositoryComponent';
import { ResourceUpdateError } from '../../helpers/errors';

export default class WatchersHandler extends AbstractRepositoryHandler {
  watchers: { items: TObject[]; hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'watchers');
    this.watchers = { items: [], hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    if (!this.watchers.endCursor) {
      this.watchers.endCursor = await Repository.collection
        .findOne({ _id: this.meta.id }, { projection: { _metadata: 1 } })
        .then((result) => result && get(result, ['_metadata', this.meta.resource, 'endCursor']));
    }

    return this._component.includeWatchers(this.watchers.hasNextPage, {
      first: this.batchSize,
      after: this.watchers.endCursor,
      alias: 'watchers'
    });
  }

  async update(response: TObject, session?: ClientSession): Promise<void> {
    const data = super.parseResponse(response[this.alias as string]);

    this.watchers.items.push(
      ...get(data, 'watchers.nodes', []).map((watcher: string) => ({
        repository: this.id,
        user: watcher
      }))
    );

    const pageInfo = get(data, 'watchers.page_info', {});
    this.watchers.hasNextPage = pageInfo.has_next_page ?? false;
    this.watchers.endCursor = pageInfo.end_cursor ?? this.watchers.endCursor;

    if (this.watchers.items.length >= this.writeBatchSize || this.isDone()) {
      await super.saveReferences(session);
      await Watcher.upsert(this.watchers.items, session);
      await Repository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.endCursor`]: this.watchers.endCursor } },
        { session }
      );
      this.watchers.items = [];
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
    return this.watchers.hasNextPage;
  }
}
