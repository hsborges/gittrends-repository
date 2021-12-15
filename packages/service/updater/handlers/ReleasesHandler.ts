/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { Release, MongoRepository, Repository } from '@gittrends/database-config';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';

export default class ReleasesHandler extends AbstractRepositoryHandler {
  static resource: string = 'releases';

  releases: { hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias);
    this.releases = { hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    if (!this.releases.endCursor) {
      this.releases.endCursor = await MongoRepository.get(Repository)
        .collection.findOne({ _id: this.id }, { projection: { _metadata: 1 } })
        .then((res) => res && get(res, `_metadata.${ReleasesHandler.resource}.endCursor`));
    }

    return this._component.includeReleases(this.releases.hasNextPage, {
      first: this.batchSize,
      after: this.releases.endCursor,
      alias: '_releases'
    });
  }

  async update(response: Record<string, unknown>): Promise<void> {
    const data = super.parseResponse(response[this.alias as string]);

    const pageInfo = get(data, '_releases.page_info', {});
    this.releases.hasNextPage = pageInfo.has_next_page ?? false;
    this.releases.endCursor = pageInfo.end_cursor ?? this.releases.endCursor;

    await Promise.all([
      super.saveReferences(),
      MongoRepository.get(Release).upsert(
        get<Record<string, unknown>[]>(data, '_releases.nodes', []).map(
          (release) => new Release({ repository: this.id, ...release })
        )
      )
    ]);

    await MongoRepository.get(Repository).collection.updateOne(
      { _id: this.id },
      { $set: { [`_metadata.${ReleasesHandler.resource}.endCursor`]: this.releases.endCursor } }
    );

    if (this.isDone()) {
      await MongoRepository.get(Repository).collection.updateOne(
        { _id: this.id },
        { $set: { [`_metadata.${ReleasesHandler.resource}.updatedAt`]: new Date() } }
      );
    }
  }

  hasNextPage(): boolean {
    return this.releases.hasNextPage;
  }
}
