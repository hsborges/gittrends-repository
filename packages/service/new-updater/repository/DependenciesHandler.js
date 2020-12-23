const { get } = require('lodash');

const Handler = require('./Handler');
const DependencyGraphManifestComponent = require('../../github/graphql/components/DependencyGraphManifestComponent');

module.exports = class RepositoryDependenciesHander extends Handler {
  constructor(component) {
    super();
    this.component = component;
    this.manifests = { items: [], hasNextPage: true, endCursor: null };
    this.components = [];
    this.meta = { id: this.component.id, resource: 'dependencies' };
  }

  async updateComponent() {
    this.component.includeDependencyManifests(this.manifests.hasNextPage, {
      after: this.manifests.endCursor || null
    });

    if (!this.manifests.hasNextPage && !this.components.length) {
      this.components = this.manifests.items.map((manifest, index) => ({
        manifest,
        component: DependencyGraphManifestComponent.with({
          id: manifest.id,
          name: `manifest_${index}`
        })
          .includeDetails(false)
          .includeDependencies(),
        hasNextPage: manifest.parseable,
        endCursor: null
      }));
    }

    if (!this.manifests.hasNextPage && this.hasNextPage) {
      this.component.includeManifests(true, {
        components: this.validComponents.map((c) => c.component)
      });
    }
  }

  async updateDatabase(data, trx = null) {
    if (this.done) return;

    if (data && this.manifests.hasNextPage) {
      this.manifests.items.push(...get(data, 'repository.dependency_graph_manifests.nodes', []));

      const pageInfo = 'repository.dependency_graph_manifests.page_info';
      this.manifests.hasNextPage = get(data, `${pageInfo}.has_next_page`);
      this.manifests.endCursor = get(data, `${pageInfo}.end_cursor`, this.manifests.endCursor);

      if (!this.manifests.items.length && !this.manifests.hasNextPage)
        await this.dao.metadata.upsert(
          [{ ...this.meta, key: 'updatedAt', value: new Date().toISOString() }],
          trx
        );
    } else if (data && !this.manifests.hasNextPage && this.hasNextPage) {
      await Promise.map(this.validComponents, (component) => {
        const dependencies = get(data, `${component.component.name}.dependencies.nodes`, []).map(
          (dependency) => ({
            repository: this.component.id,
            manifest: component.manifest.id,
            filename: component.manifest.filename,
            ...dependency
          })
        );

        const pageInfo = `${component.component.name}.dependencies.page_info`;
        component.hasNextPage = get(data, `${pageInfo}.has_next_page`);
        component.endCursor = get(data, `${pageInfo}.end_cursor`, component.endCursor);

        this.dao.dependencies.insert(dependencies, trx);
      });
    }

    if (!this.hasNextPage) {
      await this.dao.metadata.upsert(
        [{ ...this.meta, key: 'updatedAt', value: new Date().toISOString() }],
        trx
      );
    }
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
