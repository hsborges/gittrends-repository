/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';
import { ClientSession } from 'mongodb';
import { Dependency, Repository } from '@gittrends/database-config';

import Component from '../../github/Component';
import RepositoryComponent from '../../github/components/RepositoryComponent';
import DependencyGraphManifestComponent from '../../github/components/DependencyGraphManifestComponent';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import { ResourceUpdateError, RetryableError } from '../../helpers/errors';

type TManifestMetadata = {
  data: TObject;
  component: DependencyGraphManifestComponent;
  hasNextPage: boolean;
  endCursor?: string;
};

export default class DependenciesHander extends AbstractRepositoryHandler {
  readonly manifests: { hasNextPage: boolean; endCursor?: string };
  readonly manifestsComponents: Array<TManifestMetadata>;

  constructor(id: string, alias?: string) {
    super(id, alias, 'dependencies');
    this.manifests = { hasNextPage: true };
    this.manifestsComponents = [];
  }

  async component(): Promise<RepositoryComponent | Component[]> {
    if (this.manifests.hasNextPage) {
      return this._component.includeDependencyManifests(this.manifests.hasNextPage, {
        first: this.batchSize,
        after: this.manifests.endCursor
      });
    }

    const pendingManifests = this.getPendingManifests();
    pendingManifests.forEach((manifest) => {
      manifest.component.includeDependencies(manifest.hasNextPage, {
        first: this.batchSize,
        after: manifest.endCursor
      });
    });

    return pendingManifests.map((c) => c.component);
  }

  async update(response: TObject, session?: ClientSession): Promise<void> {
    if (this.isDone()) return;

    if (response && this.manifests.hasNextPage) {
      const data = response[this.alias[0]];

      this.manifestsComponents.push(
        ...get(data, 'dependency_graph_manifests.nodes', []).map(
          (manifest: TObject, index: number) => ({
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

      const pageInfo = 'dependency_graph_manifests.page_info';
      this.manifests.hasNextPage = get(data, `${pageInfo}.has_next_page`);
      this.manifests.endCursor = get(data, `${pageInfo}.end_cursor`, this.manifests.endCursor);

      if (this.hasNextPage()) {
        this.batchSize = Math.min(this.defaultBatchSize, this.batchSize * 2);
        return;
      }
    }

    if (response && !this.manifests.hasNextPage && this.hasNextPage) {
      const dependencies = this.getPendingManifests().reduce(
        (dependencies: Array<TObject>, manifest) => {
          const piPath = `${manifest.component.alias}.dependencies.page_info`;
          const pageInfo = get(response as unknown, piPath, {});

          manifest.hasNextPage = pageInfo.has_next_page || false;
          manifest.endCursor = pageInfo.end_cursor || manifest.endCursor;

          const nodes = get(response, `${manifest.component.alias}.dependencies.nodes`, []) as [];

          return dependencies.concat(
            nodes.map((dependency: TObject) => ({
              repository: this.id,
              manifest: manifest.data.id,
              filename: manifest.data.filename,
              ...dependency
            }))
          );
        },
        []
      );

      if (dependencies.length > 0) await Dependency.upsert(dependencies, session);

      if (this.hasNextPage()) {
        this.batchSize = Math.min(this.defaultBatchSize, this.batchSize * 2);
        return;
      }
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
    if (err instanceof RetryableError) {
      if (this.batchSize > 1) {
        this.batchSize = Math.floor(this.batchSize / 2);
        return;
      }

      const [pending] = this.getPendingManifests();
      pending.hasNextPage = false;

      await Repository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.error`]: err.message } }
      );

      throw err;
    }

    throw new ResourceUpdateError(err.message, err);
  }

  getPendingManifests(): Array<TManifestMetadata> {
    return this.manifestsComponents
      .filter((m) => m.data.parseable && !m.data.exceeds_max_size && m.hasNextPage)
      .slice(0, this.batchSize);
  }

  get alias(): string[] {
    return [super.alias as string].concat(
      this.getPendingManifests().map((manifest) => manifest.component.alias)
    );
  }

  hasNextPage(): boolean {
    return this.manifests.hasNextPage || this.getPendingManifests().length > 0;
  }
}
