const Component = require('../Component');

const ActorFragment = require('./ActorFragment');
const CommitFragment = require('./CommitFragment');
const RepositoryFragment = require('./RepositoryFragment');
const ReleaseFragment = require('./ReleaseFragment');
const TagFragment = require('./TagFragment');

module.exports = class RepositoryComponent extends Component {
  constructor({ id, fullName, full = true }) {
    if (!id && !fullName) throw new Error('ID or name (owner/name) is mandatory!');

    super();
    this.selector = fullName
      ? `repository(owner: "${fullName.split('/')[0]}", name: "${fullName.split('/')[1]}")`
      : `node(id: "${id}")`;

    this.fragments = [];
    this._includeDetails = '';
    this._includeLanguages = '';
    this._includeTopics = '';
    this._includeStargazers = '';
    this._includeWatchers = '';
    this._includeTags = '';
    this._includeReleases = '';
  }

  static withID(id) {
    const component = new RepositoryComponent({ id });
    component.fragments.push(new RepositoryFragment(true));
    return component.includeDetails();
  }

  includeDetails(include = true) {
    this._includeDetails = include ? `...${RepositoryFragment.code}` : '';
    return this;
  }

  includeLanguages(include = true, after) {
    this._includeLanguages = include
      ? `
          languages(first: $total${after ? `, after: "${after}"` : ''}) {
            pageInfo { hasNextPage endCursor }
            edges { language:node { name } size }
          }
        `
      : '';
    return this;
  }

  includeTopics(include = true, after) {
    this._includeTopics = include
      ? `
          repositoryTopics(first: $total${after ? `, after: "${after}"` : ''}) {
            pageInfo { hasNextPage endCursor }
            nodes { topic { name } }
          }
        `
      : '';
    return this;
  }

  includeStargazers(include = true, { after, total = 100 } = {}) {
    const args = [total ? `first: ${total}` : '', after ? `after: "${after}"` : '']
      .filter((v) => v)
      .join(', ');

    this.fragments.push(new ActorFragment());
    this._includeStargazers = include
      ? `
          stargazers(${args}, orderBy: { direction: ASC, field: STARRED_AT }) {
            pageInfo { hasNextPage endCursor }
            edges { starredAt user:node { ...${ActorFragment.code} } }
          }
        `
      : '';
    return this;
  }

  includeWatchers(include = true, { after, total = 100 } = {}) {
    const args = [total ? `first: ${total}` : '', after ? `after: "${after}"` : '']
      .filter((v) => v)
      .join(', ');

    this.fragments.push(new ActorFragment());
    this._includeWatchers = include
      ? `
          watchers(${args}) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${ActorFragment.code} }
          }
        `
      : '';
    return this;
  }

  includeReleases(include = true, { after, total = 100 } = {}) {
    const args = [total ? `first: ${total}` : '', after ? `after: "${after}"` : '']
      .filter((v) => v)
      .join(', ');

    this.fragments.push(new ReleaseFragment());

    this._includeReleases = include
      ? `
          releases(${args}) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${ReleaseFragment.code} }
          }
        `
      : '';
    return this;
  }

  includeTags(include = true, { after, total = 100 } = {}) {
    const args = [total ? `first: ${total}` : '', after ? `after: "${after}"` : '']
      .filter((v) => v)
      .join(', ');

    this.fragments.push(new CommitFragment());
    this.fragments.push(new TagFragment());

    this._includeTags = include
      ? `
          tags:refs(refPrefix:"refs/tags/", ${args}, direction: ASC) {
            pageInfo { hasNextPage endCursor }
            edges {
              cursor
              node {
                id name
                target { type:__typename id oid ...${CommitFragment.code} ...${TagFragment.code} }
              }
            }
          }
        `
      : '';
    return this;
  }

  toString() {
    return `
    repository:${this.selector} {
      ${this._includeDetails}
      ... on Repository {
        ${this._includeLanguages}
        ${this._includeTopics}
        ${this._includeStargazers}
        ${this._includeWatchers}
        ${this._includeTags}
        ${this._includeReleases}
      }
    }
    `;
  }
};
