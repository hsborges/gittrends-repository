const Component = require('../Component');

module.exports = class DependencyGraphManifestComponent extends Component {
  constructor(id, name) {
    if (!id) throw new Error('ID or name (owner/name) is mandatory!');

    super();

    this.id = id;
    this.name = name || 'manifest';

    this._includeDetails = '';
    this._includeDependencies = '';
  }

  get fragments() {
    return [];
  }

  static with({ id, name }) {
    return new DependencyGraphManifestComponent(id, name);
  }

  includeDetails(include = true) {
    this._includeDetails = include
      ? `
      ... on DependencyGraphManifest {
        dependenciesCount
        exceedsMaxSize
        filename
        id
        parseable
      }
    `
      : '';

    return this;
  }

  includeDependencies(include = true, { after, first = 100 } = {}) {
    this._includeDependencies = include
      ? `
      ... on DependencyGraphManifest {
        dependencies (${super.$argsToString({ after, first })}) {
          pageInfo { hasNextPage endCursor }
          nodes {
            hasDependencies
            packageManager
            packageName
            targetRepository:repository { id databaseId nameWithOwner }
            requirements
          }
        }
      }
    `
      : '';

    return this;
  }

  toString() {
    return `
      ${this.name}:node(id: "${this.id}") {
        type: __typename
        ${this._includeDetails}
        ${this._includeDependencies}
      }
    `;
  }
};
