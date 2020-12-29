/*
 *  Author: Hudson S. Borges
 */
const Component = require('../Component');

const ActorFragment = require('../fragments/ActorFragment').simplified;
const CommitFragment = require('../fragments/CommitFragment');
const RepositoryFragment = require('../fragments/RepositoryFragment');
const ReleaseFragment = require('../fragments/ReleaseFragment');
const TagFragment = require('../fragments/TagFragment');
const IssueFragment = require('../fragments/IssueFragment').simplified;
const PullRequestFragment = require('../fragments/PullRequestFragment').simplified;

module.exports = class RepositoryComponent extends Component {
  constructor(id, alias) {
    if (!id) throw new Error('ID or name (owner/name) is mandatory!');

    super();
    this.id = id;
    this.alias = alias || 'repository';
    this._includes = {};
    this._components = [];
  }

  get fragments() {
    const fragments = [];

    if (this._includes.stargazers || this._includes.watchers) fragments.push(ActorFragment);
    if (this._includes.details) fragments.push(RepositoryFragment);
    if (this._includes.releases) fragments.push(ReleaseFragment);
    if (this._includes.tags) fragments.push(CommitFragment, TagFragment);
    if (this._includes.issues) fragments.push(IssueFragment);
    if (this._includes.pull_requests) fragments.push(PullRequestFragment);

    if (this._components && this._components.length)
      fragments.push(
        ...this._components.reduce((acc, component) => acc.concat(component.fragments), [])
      );

    return fragments;
  }

  static create({ id, alias }) {
    return new RepositoryComponent(id, alias).includeDetails();
  }

  includeDetails(include = true) {
    this._includes.details = include ? `...${RepositoryFragment.code}` : '';
    return this;
  }

  includeLanguages(include = true, { after, first = 100 } = {}) {
    this._includes.languages = include
      ? `
          languages(${super.$argsToString({ after, first })}) {
            pageInfo { hasNextPage endCursor }
            edges { language:node { name } size }
          }
        `
      : '';

    return this;
  }

  includeTopics(include = true, { after, first = 100 } = {}) {
    this._includes.topics = include
      ? `
          repositoryTopics(${super.$argsToString({ after, first })}) {
            pageInfo { hasNextPage endCursor }
            nodes { topic { name } }
          }
        `
      : '';

    return this;
  }

  includeStargazers(include = true, { after, first = 100, name = '_stargazers' } = {}) {
    const args = super.$argsToString({ after, first });

    this._includes.stargazers = include
      ? `
          ${name}:stargazers(${args}, orderBy: { direction: ASC, field: STARRED_AT }) {
            pageInfo { hasNextPage endCursor }
            edges { starredAt user:node { ...${ActorFragment.code} } }
          }
        `
      : '';

    return this;
  }

  includeWatchers(include = true, { after, first = 100, name = '_watchers' } = {}) {
    this._includes.watchers = include
      ? `
          ${name}:watchers(${super.$argsToString({ after, first })}) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${ActorFragment.code} }
          }
        `
      : '';

    return this;
  }

  includeReleases(include = true, { after, first = 100, name = '_releases' } = {}) {
    const args = super.$argsToString({ after, first });

    this._includes.releases = include
      ? `
          ${name}:releases(${args}, orderBy: { field: CREATED_AT, direction: ASC  }) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${ReleaseFragment.code} }
          }
        `
      : '';

    return this;
  }

  includeTags(include = true, { after, first = 100, name = '_tags' } = {}) {
    const args = super.$argsToString({ after, first });

    this._includes.tags = include
      ? `
          ${name}:refs(refPrefix:"refs/tags/", ${args}, direction: ASC) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id name
              target { type:__typename id oid ...${CommitFragment.code} ...${TagFragment.code} }
            }
          }
        `
      : '';

    return this;
  }

  includeDependencyManifests(include = true, { after, first = 100 } = {}) {
    this._includes.manifests = include
      ? `
          dependencyGraphManifests(${super.$argsToString({ after, first })}) {
            pageInfo { hasNextPage endCursor }
            nodes { dependenciesCount exceedsMaxSize filename id parseable }
          }
        `
      : '';

    return this;
  }

  includeComponents(include = true, components = []) {
    this._components = include && components.length ? components : [];
    return this;
  }

  includeIssues(include = true, { after, first = 100, name = '_issues' } = {}) {
    const args = super.$argsToString({ after, first });

    this._includes.issues = include
      ? `
          ${name}:issues(${args}, orderBy: { field: UPDATED_AT, direction: ASC }) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${IssueFragment.code} }
          }
        `
      : '';

    return this;
  }

  includePullRequests(include = true, { after, first = 100, name = '_pullRequests' } = {}) {
    const args = super.$argsToString({ after, first });

    this._includes.pull_requests = include
      ? `
          ${name}:pullRequests(${args}, orderBy: { field: UPDATED_AT, direction: ASC }) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${PullRequestFragment.code} }
          }
        `
      : '';

    return this;
  }

  get _repositoryFragment() {
    return Object.values(this._includes).reduce((acc, include) => acc || !!include, false)
      ? `
        ... on Repository {
          ${Object.values(this._includes).join('\n')}
        }
    `
      : '';
  }

  toString() {
    return `
    ${
      this._repositoryFragment
        ? `
          ${this.alias}:node(id: "${this.id}") {
            ${this._repositoryFragment}
          }
        `
        : ''
    }
    ${this._components.map((component) => component.toString()).join('\n')}
    `;
  }
};
