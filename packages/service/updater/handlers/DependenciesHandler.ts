/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { Dependency, Metadata, MongoRepository } from '@gittrends/database';

import Component from '../../github/Component';
import DependencyGraphManifestComponent from '../../github/components/DependencyGraphManifestComponent';
import RepositoryComponent from '../../github/components/RepositoryComponent';
import { RequestError } from '../../helpers/errors';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';

type TManifestMetadata = {
  data: Record<string, unknown>;
  component: DependencyGraphManifestComponent;
  hasNextPage: boolean;
  endCursor?: string;
  error?: Error[];
};

export default class DependenciesHandler extends AbstractRepositoryHandler {
  static resource: string = 'dependencies';

  readonly manifests: { hasNextPage: boolean; endCursor?: string } = { hasNextPage: true };
  readonly manifestsComponents: Array<TManifestMetadata> = [];

  async component(): Promise<RepositoryComponent | Component[]> {
    if (this.pendingManifests.length > 0) {
      return this.pendingManifests.map((manifest) =>
        manifest.component.includeDependencies(manifest.hasNextPage, {
          first: this.batchSize,
          after: manifest.endCursor
        })
      );
    }

    return this._component.includeDependencyManifests(this.manifests.hasNextPage, {
      first: this.batchSize,
      after: this.manifests.endCursor
    });
  }

  async update(response: Record<string, unknown>): Promise<void> {
    return this._update(response).finally(
      () => (this.batchSize = Math.min(this.defaultBatchSize, this.batchSize * 2))
    );
  }

  private async _update(response: Record<string, unknown>): Promise<void> {
    if (this.pendingManifests.length > 0) {
      this.entityStorage.add(
        this.pendingManifests.reduce((dependencies: Dependency[], manifest) => {
          const piPath = `${manifest.component.alias}.dependencies.page_info`;
          const pageInfo = get(response as unknown, piPath, {});

          manifest.hasNextPage = pageInfo.has_next_page || false;
          manifest.endCursor = pageInfo.end_cursor || manifest.endCursor;

          const nodes = get(response, `${manifest.component.alias}.dependencies.nodes`, []) as [];

          return dependencies.concat(
            nodes.map(
              (dependency: Record<string, unknown>) =>
                new Dependency({
                  repository: this.id,
                  manifest: manifest.data.id,
                  filename: manifest.data.filename,
                  ...dependency
                })
            )
          );
        }, [])
      );
    }

    if (this.pendingManifests.length === 0 && this.manifests.hasNextPage) {
      const data = super.parseResponse(response[this.alias[0]]);

      this.manifestsComponents.push(
        ...get(data, '_manifests.nodes', []).map(
          (manifest: Record<string, unknown>, index: number) => ({
            data: manifest,
            component: new DependencyGraphManifestComponent(
              manifest.id as string,
              `${this.alias}_manifest_${index}`
            )
              .includeDetails(false)
              .includeDependencies(true, { first: this.batchSize }),
            hasNextPage: manifest.parseable
          })
        )
      );

      const pageInfo = get(data, '_manifests.page_info', {});
      this.manifests.hasNextPage = pageInfo.has_next_page ?? false;
      this.manifests.endCursor = pageInfo.end_cursor ?? this.manifests.endCursor;

      return;
    }

    if (this.entityStorage.size() >= this.writeBatchSize || this.isDone()) {
      await this.entityStorage.persist();
    }

    if (this.isDone()) {
      const errorSample = this.manifestsComponents.find((mfc) => mfc.error?.length);
      if (errorSample) throw errorSample.error?.[0];

      await MongoRepository.get(Metadata).collection.updateOne(
        { _id: this.id },
        { $set: { [`${DependenciesHandler.resource}.updatedAt`]: new Date() } },
        { upsert: true }
      );
    }
  }

  async error(err: Error): Promise<void> {
    if (err instanceof RequestError) {
      const [pending] = this.pendingManifests;

      if (pending) {
        pending.hasNextPage = false;
        pending.error = (pending.error || []).concat([err]);

        await MongoRepository.get(Metadata).collection.updateOne(
          { _id: this.id },
          { $set: { [`${DependenciesHandler.resource}.error`]: err.message } },
          { upsert: true }
        );

        return this.isDone() ? Promise.reject(err) : Promise.resolve();
      } else if (this.batchSize > 1) {
        this.batchSize = 1;
        return;
      }
    }

    return super.error(err);
  }

  get pendingManifests(): Array<TManifestMetadata> {
    return this.manifestsComponents
      .filter((m) => !m.data.exceeds_max_size && m.hasNextPage)
      .slice(0, 1);
  }

  get alias(): string[] {
    return [super.alias as string].concat(
      this.pendingManifests.map((manifest) => manifest.component.alias)
    );
  }

  hasNextPage(): boolean {
    return this.manifests.hasNextPage || this.pendingManifests.length > 0;
  }
}
