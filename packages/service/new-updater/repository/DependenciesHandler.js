const { get } = require('lodash');

const AbstractRepositoryHandler = require('./AbstractRepositoryHandler');
const DependencyGraphManifestComponent = require('../../github/graphql/components/DependencyGraphManifestComponent');

module.exports = class RepositoryDependenciesHander extends AbstractRepositoryHandler {
  constructor(id, alias) {
    super(id, alias);
    this.manifests = { items: [], hasNextPage: true, endCursor: null };
    this.components = [];
    this.meta = { id: this.component.id, resource: 'dependencies' };
  }

  async updateComponent() {
    this.component.includeDependencyManifests(this.manifests.hasNextPage, {
      first: this.batchSize,
      after: this.manifests.endCursor || null
    });

    if (!this.manifests.hasNextPage && !this.components.length) {
      this.components = this.manifests.items.map((manifest, index) => ({
        manifest,
        component: DependencyGraphManifestComponent.with({
          id: manifest.id,
          name: `${this.alias}_manifest_${index}`
        })
          .includeDetails(false)
          .includeDependencies(),
        hasNextPage: manifest.parseable,
        endCursor: null
      }));
    }

    if (!this.manifests.hasNextPage && this.hasNextPage) {
      this.component.includeComponents(
        true,
        this.validComponents.map((c) => c.component)
      );
    }
  }

  async updateDatabase(response, trx = null) {
    if (this.done) return;

    if (response && this.manifests.hasNextPage) {
      const data = response[this.alias];

      this.manifests.items.push(...get(data, 'dependency_graph_manifests.nodes', []));

      const pageInfo = 'dependency_graph_manifests.page_info';
      this.manifests.hasNextPage = get(data, `${pageInfo}.has_next_page`);
      this.manifests.endCursor = get(data, `${pageInfo}.end_cursor`, this.manifests.endCursor);
    } else if (response && !this.manifests.hasNextPage && this.hasNextPage) {
      await Promise.map(this.validComponents, async (vComp) => {
        const dependencies = get(response, `${vComp.component.name}.dependencies.nodes`, []).map(
          (dependency) => ({
            repository: this.component.id,
            manifest: vComp.manifest.id,
            filename: vComp.manifest.filename,
            ...dependency
          })
        );

        const pageInfo = `${vComp.component.name}.dependencies.page_info`;
        vComp.hasNextPage = get(response, `${pageInfo}.has_next_page`);
        vComp.endCursor = get(response, `${pageInfo}.end_cursor`, vComp.endCursor);

        await this.dao.dependencies.insert(dependencies, trx);
      });
    }

    if (!this.manifests.hasNextPage)
      await this.dao.metadata.upsert(
        [{ ...this.meta, key: 'updatedAt', value: new Date().toISOString() }],
        trx
      );
  }

  get validComponents() {
    return this.components.filter(
      (c) => c.manifest.parseable && !c.manifest.exceeds_max_size && c.hasNextPage
    );
  }

  get hasNextPage() {
    return (
      this.manifests.hasNextPage ||
      this.validComponents.reduce((acc, c) => acc || c.hasNextPage, false)
    );
  }
};
