/*
 *  Author: Hudson S. Borges
 */
const { get } = require('lodash');
const { RetryableError } = require('../../helpers/errors');

const AbstractRepositoryHandler = require('./AbstractRepositoryHandler');
const DependencyGraphManifestComponent = require('../../github/graphql/components/DependencyGraphManifestComponent');

const debug = require('debug')('updater:dependencies-handler');

module.exports = class RepositoryDependenciesHander extends AbstractRepositoryHandler {
  constructor(id, alias) {
    super(id, alias);
    this.meta = { id: this.component.id, resource: 'dependencies' };
    this.manifests = { hasNextPage: true, endCursor: null };
    this.manifestsComponents = [];
  }

  async updateComponent() {
    this.component.includeDependencyManifests(this.manifests.hasNextPage, {
      first: this.batchSize,
      after: this.manifests.endCursor || null
    });

    if (!this.manifests.hasNextPage && this.hasNextPage) {
      const pendingManifests = this.getPendingManifests();

      pendingManifests.forEach((manifest) => {
        manifest.component.includeDependencies(manifest.hasNextPage, {
          first: this.batchSize,
          after: manifest.endCursor
        });
      });

      this.component.includeComponents(
        true,
        pendingManifests.map((c) => c.component)
      );
    }
  }

  async updateDatabase(response, trx = null) {
    if (this.done) return;

    if (response && this.manifests.hasNextPage) {
      const data = response[this.alias];

      this.manifestsComponents.push(
        ...get(data, 'dependency_graph_manifests.nodes', []).map((manifest, index) => ({
          data: manifest,
          component: DependencyGraphManifestComponent.create({
            id: manifest.id,
            alias: `${this.alias}_manifest_${index}`
          })
            .includeDetails(false)
            .includeDependencies(true, { first: this.batchSize }),
          hasNextPage: manifest.parseable,
          endCursor: null
        }))
      );

      debug(
        `List of ${this.manifestsComponents.length} manifests obtained from ${this.component.id} ...`
      );

      const pageInfo = 'dependency_graph_manifests.page_info';
      this.manifests.hasNextPage = get(data, `${pageInfo}.has_next_page`);
      this.manifests.endCursor = get(data, `${pageInfo}.end_cursor`, this.manifests.endCursor);

      if (this.hasNextPage)
        return (this.batchSize = Math.min(this.defaultBatchSize, this.batchSize * 2));
    }

    if (response && !this.manifests.hasNextPage && this.hasNextPage) {
      await Promise.reduce(
        this.getPendingManifests(),
        async (dependencies, manifest) => {
          const pageInfo = `${manifest.component.alias}.dependencies.page_info`;
          manifest.hasNextPage = get(response, `${pageInfo}.has_next_page`);
          manifest.endCursor = get(response, `${pageInfo}.end_cursor`, manifest.endCursor);

          return dependencies.concat(
            get(response, `${manifest.component.alias}.dependencies.nodes`, []).map(
              (dependency) => ({
                repository: this.component.id,
                manifest: manifest.data.id,
                filename: manifest.data.filename,
                ...dependency
              })
            )
          );
        },
        []
      ).then((dependencies) => {
        debug(`Inserting ${dependencies.length} dependencies from ${this.component.id} ...`);
        return this.dao.dependencies.insert(dependencies, trx);
      });

      if (this.hasNextPage)
        return (this.batchSize = Math.min(this.defaultBatchSize, this.batchSize * 2));
    }

    if (this.done) {
      debug(`Dependencies from ${this.component.id} updated!`);
      return this.dao.metadata.upsert(
        [{ ...this.meta, key: 'updatedAt', value: new Date().toISOString() }],
        trx
      );
    }
  }

  error(err) {
    if (err instanceof RetryableError) {
      debug(`An error was detected (${err.constructor.name}). Reducing batch size ...`);

      if (this.batchSize > 1) return (this.batchSize = Math.floor(this.batchSize / 2));

      const pending = this.getPendingManifests();
      pending.hasNextPage = false;

      return this.dao.metadata.upsert([{ ...this.meta, key: 'error', value: err.message }]);
    }

    super.error(err);
  }

  getPendingManifests() {
    return this.manifestsComponents
      .filter((m) => m.data.parseable && !m.data.exceeds_max_size && m.hasNextPage)
      .slice(0, this.batchSize);
  }

  get alias() {
    return [super.alias].concat(
      this.getPendingManifests().map((manifest) => manifest.component.alias)
    );
  }

  get hasNextPage() {
    return this.manifests.hasNextPage || this.getPendingManifests().length;
  }
};
