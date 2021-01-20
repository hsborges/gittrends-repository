/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';
import { Transaction } from 'knex';
import { Metadata, Watcher } from '@gittrends/database-config';

import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import RepositoryComponent from '../../github/components/RepositoryComponent';

export default class WatchersHandler extends AbstractRepositoryHandler {
  watchers: { items: TObject[]; hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'watchers');
    this.watchers = { items: [], hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    if (!this.watchers.endCursor) {
      this.watchers.endCursor = await Metadata.query()
        .where({ ...this.meta, key: 'endCursor' })
        .first()
        .then((result) => result && result.value);
    }

    return this._component.includeWatchers(this.watchers.hasNextPage, {
      first: this.batchSize,
      after: this.watchers.endCursor,
      alias: 'watchers'
    });
  }

  async update(response: TObject, trx: Transaction): Promise<void> {
    if (this.isDone()) return;

    const data = response[this.alias as string];

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
      await Promise.all([
        Watcher.insert(this.watchers.items, trx),
        Metadata.upsert({ ...this.meta, key: 'endCursor', value: this.watchers.endCursor }, trx)
      ]);
      this.watchers.items = [];
    }

    if (this.isDone()) {
      await Metadata.upsert({ ...this.meta, key: 'updatedAt', value: new Date() });
    }
  }

  hasNextPage(): boolean {
    return this.watchers.hasNextPage;
  }
}
