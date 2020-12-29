/*
 *  Author: Hudson S. Borges
 */
const Component = require('../Component');

module.exports = class DependencyGraphManifestComponent extends Component {
  constructor(id, alias) {
    if (!id) throw new Error('ID or name (owner/name) is mandatory!');

    super();
    this.id = id;
    this.alias = alias || 'manifest';
    this._includeDetails = '';
    this._includeDependencies = '';
  }

  get fragments() {
    return [];
  }

  static create({ id, alias }) {
    return new DependencyGraphManifestComponent(id, alias);
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
      ${this.alias}:node(id: "${this.id}") {
        type: __typename
        ${this._includeDetails}
        ${this._includeDependencies}
      }
    `;
  }
};
