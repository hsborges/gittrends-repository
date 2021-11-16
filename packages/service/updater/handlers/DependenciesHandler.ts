/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { Dependency, DependencyRepository, RepositoryRepository } from '@gittrends/database-config';

import Component from '../../github/Component';
import DependencyGraphManifestComponent from '../../github/components/DependencyGraphManifestComponent';
import RepositoryComponent from '../../github/components/RepositoryComponent';
import { RetryableError } from '../../helpers/errors';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';

type TManifestMetadata = {
  data: Record<string, unknown>;
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

  async update(response: Record<string, unknown>): Promise<void> {
    return this._update(response).finally(
      () => (this.batchSize = Math.min(this.defaultBatchSize, this.batchSize * 2))
    );
  }

  private async _update(response: Record<string, unknown>): Promise<void> {
    if (response && this.manifests.hasNextPage) {
      const data = super.parseResponse(response[this.alias[0]]);

      this.manifestsComponents.push(
        ...get(data, 'dependency_graph_manifests.nodes', []).map(
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

      const pageInfo = get(data, 'dependency_graph_manifests.page_info', {});
      this.manifests.hasNextPage = pageInfo.has_next_page ?? false;
      this.manifests.endCursor = pageInfo.end_cursor ?? this.manifests.endCursor;

      if (this.hasNextPage()) return;
    }

    if (response && !this.manifests.hasNextPage && this.hasNextPage) {
      const dependencies = this.getPendingManifests().reduce(
        (dependencies: Dependency[], manifest) => {
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
        },
        []
      );

      if (dependencies.length > 0) {
        await Promise.all([super.saveReferences(), DependencyRepository.upsert(dependencies)]);
      }

      if (this.hasNextPage()) return;
    }

    if (this.isDone()) {
      await RepositoryRepository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.updatedAt`]: new Date() } }
      );
    }
  }

  async error(err: Error): Promise<void> {
    if (err instanceof RetryableError) {
      if (this.batchSize > 1) {
        this.batchSize = 1;
        return;
      }

      const [pending] = this.getPendingManifests();
      pending.hasNextPage = false;

      await RepositoryRepository.collection.updateOne(
        { _id: this.meta.id },
        { $set: { [`_metadata.${this.meta.resource}.error`]: err.message } }
      );
    }

    return super.error(err);
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
