/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { Release, ReleaseRepository, RepositoryRepository } from '@gittrends/database-config';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import { ResourceUpdateError } from '../../helpers/errors';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';

export default class ReleasesHandler extends AbstractRepositoryHandler {
  releases: { items: Release[]; hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'releases');
    this.releases = { items: [], hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    if (!this.releases.endCursor) {
      this.releases.endCursor = await RepositoryRepository.collection
        .findOne({ _id: this.meta.id }, { projection: { _metadata: 1 } })
        .then((result) => result && get(result, ['_metadata', this.meta.resource, 'endCursor']));
    }

    return this._component.includeReleases(this.releases.hasNextPage, {
      first: this.batchSize,
      after: this.releases.endCursor,
      alias: '_releases'
    });
  }

  async update(response: Record<string, unknown>): Promise<void> {
    const data = super.parseResponse(response[this.alias as string]);

    this.releases.items.push(
      ...get<Record<string, unknown>[]>(data, '_releases.nodes', []).map(
        (release) => new Release({ repository: this.id, ...release })
      )
    );

    const pageInfo = get(data, '_releases.page_info', {});
    this.releases.hasNextPage = pageInfo.has_next_page ?? false;
    this.releases.endCursor = pageInfo.end_cursor ?? this.releases.endCursor;

    if (this.releases.items.length >= this.writeBatchSize || this.isDone()) {
      await Promise.all([super.saveReferences(), ReleaseRepository.upsert(this.releases.items)]);
      await RepositoryRepository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.endCursor`]: this.releases.endCursor } }
      );
      this.releases.items = [];
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
    return this.releases.hasNextPage;
  }
}
