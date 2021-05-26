/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';
import { ClientSession } from 'mongodb';
import { Release, Repository } from '@gittrends/database-config';

import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import RepositoryComponent from '../../github/components/RepositoryComponent';
import { ResourceUpdateError } from '../../helpers/errors';

export default class ReleasesHandler extends AbstractRepositoryHandler {
  releases: { items: TObject[]; hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'releases');
    this.releases = { items: [], hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    if (!this.releases.endCursor) {
      this.releases.endCursor = await Repository.collection
        .findOne({ _id: this.meta.id }, { projection: { _metadata: 1 } })
        .then((result) => result && get(result, ['_metadata', this.meta.resource, 'endCursor']));
    }

    return this._component.includeReleases(this.releases.hasNextPage, {
      first: this.batchSize,
      after: this.releases.endCursor,
      alias: 'releases'
    });
  }

  async update(response: TObject, session?: ClientSession): Promise<void> {
    const data = super.parseResponse(response[this.alias as string]);

    this.releases.items.push(
      ...get(data, 'releases.nodes', []).map((release: TObject) => ({
        repository: this.id,
        ...release
      }))
    );

    const pageInfo = get(data, 'releases.page_info', {});
    this.releases.hasNextPage = pageInfo.has_next_page ?? false;
    this.releases.endCursor = pageInfo.end_cursor ?? this.releases.endCursor;

    if (this.releases.items.length >= this.writeBatchSize || this.isDone()) {
      await super.saveReferences(session);
      await Release.upsert(this.releases.items, session);
      await Repository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.endCursor`]: this.releases.endCursor } },
        { session }
      );
      this.releases.items = [];
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
    return this.releases.hasNextPage;
  }
}
