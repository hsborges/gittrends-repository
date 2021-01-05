import { get } from 'lodash';
import { Transaction } from 'knex';
import { Metadata, IMetadata, Watcher } from '@gittrends/database-config';

import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import { ResourceUpdateError } from '../../helpers/errors';

export default class WatchersHandler extends AbstractRepositoryHandler {
  watchers: { hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'watchers');
    this.watchers = { hasNextPage: true };
  }

  async updateComponent(): Promise<void> {
    if (!this.watchers.endCursor) {
      this.watchers.endCursor = await Metadata.query()
        .where({ ...this.meta, key: 'endCursor' })
        .first<IMetadata>()
        .then((result) => result && result.value);
    }

    this.component.includeWatchers(this.watchers.hasNextPage, {
      first: this.batchSize,
      after: this.watchers.endCursor,
      alias: 'watchers'
    });
  }

  async updateDatabase(response: TObject, trx: Transaction): Promise<void> {
    if (this.done) return;

    const data = response[this.alias];

    const watchers = get(data, 'watchers.nodes', []).map((watcher: string) => ({
      repository: this.component.id,
      user: watcher
    }));

    const pageInfo = get(data, 'watchers.page_info', {});
    this.watchers.hasNextPage = pageInfo.has_next_page || false;
    this.watchers.endCursor = pageInfo.end_cursor || this.watchers.endCursor;

    await Promise.all([
      Watcher.insert(watchers, trx),
      Metadata.upsert({ ...this.meta, key: 'endCursor', value: this.watchers.endCursor })
    ]);

    if (this.done) {
      await Metadata.upsert({ ...this.meta, key: 'updatedAt', value: new Date() });
    }
  }

  async error(err: Error): Promise<void> {
    throw new ResourceUpdateError(err.message, err);
  }

  get hasNextPage(): boolean {
    return this.watchers.hasNextPage;
  }
}
