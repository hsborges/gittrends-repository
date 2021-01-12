/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';
import { Transaction } from 'knex';
import { Metadata, Release } from '@gittrends/database-config';

import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import RepositoryComponent from '../../github/components/RepositoryComponent';

export default class ReleasesHandler extends AbstractRepositoryHandler {
  releases: { hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'releases');
    this.releases = { hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    if (!this.releases.endCursor) {
      this.releases.endCursor = await Metadata.query()
        .where({ ...this.meta, key: 'endCursor' })
        .first()
        .then((result) => result && result.value);
    }

    return this._component.includeReleases(this.releases.hasNextPage, {
      first: this.batchSize,
      after: this.releases.endCursor,
      alias: 'releases'
    });
  }

  async update(response: TObject, trx: Transaction): Promise<void> {
    if (this.isDone()) return;

    const data = response[this.alias as string];

    const releases = get(data, 'releases.nodes', []).map((release: TObject) => ({
      repository: this.id,
      ...release
    }));

    const pageInfo = get(data, 'releases.page_info', {});
    this.releases.hasNextPage = pageInfo.has_next_page ?? false;
    this.releases.endCursor = pageInfo.end_cursor ?? this.releases.endCursor;

    if (releases.length) {
      await Promise.all([
        Release.insert(releases, trx),
        Metadata.upsert({ ...this.meta, key: 'endCursor', value: this.releases.endCursor })
      ]);
    }

    if (this.isDone()) {
      await Metadata.upsert({ ...this.meta, key: 'updatedAt', value: new Date() });
    }
  }

  hasNextPage(): boolean {
    return this.releases.hasNextPage;
  }
}
