const Component = require('../Component');

const ActorFragment = require('../fragments/ActorFragment').simplified;
const CommitFragment = require('../fragments/CommitFragment');
const RepositoryFragment = require('../fragments/RepositoryFragment');
const ReleaseFragment = require('../fragments/ReleaseFragment');
const TagFragment = require('../fragments/TagFragment');
const IssueFragment = require('../fragments/IssueFragment').simplified;
const PullRequestFragment = require('../fragments/PullRequestFragment').simplified;

module.exports = class RepositoryComponent extends Component {
  constructor(id, name) {
    if (!id) throw new Error('ID or name (owner/name) is mandatory!');

    super();

    this.id = id;
    this._name = name || 'repository';

    this._includeDetails = '';
    this._includeLanguages = '';
    this._includeTopics = '';
    this._includeStargazers = '';
    this._includeWatchers = '';
    this._includeTags = '';
    this._includeReleases = '';
    this._includeDependencyGraphManifests = '';
    this._includeIssues = '';
    this._includePullRequests = '';
  }

  get fragments() {
    const fragments = [];

    if (this._includeStargazers || this._includeWatchers) fragments.push(ActorFragment);
    if (this._includeDetails) fragments.push(RepositoryFragment);
    if (this._includeReleases) fragments.push(ReleaseFragment);
    if (this._includeTags) fragments.push(CommitFragment, TagFragment);
    if (this._includeIssues) fragments.push(IssueFragment);
    if (this._includePullRequests) fragments.push(PullRequestFragment);

    return fragments;
  }

  static with({ id, name }) {
    return new RepositoryComponent(id, name).includeDetails();
  }

  includeDetails(include = true) {
    this._includeDetails = include ? `...${RepositoryFragment.code}` : '';
    return this;
  }

  includeLanguages(include = true, { after, first = 100 } = {}) {
    this._includeLanguages = include
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
    this._includeTopics = include
      ? `
          repositoryTopics(${super.$argsToString({ after, first })}) {
            pageInfo { hasNextPage endCursor }
            nodes { topic { name } }
          }
        `
      : '';

    return this;
  }

  includeStargazers(include = true, { after, first = 100 } = {}) {
    const args = super.$argsToString({ after, first });

    this._includeStargazers = include
      ? `
          stargazers(${args ? `${args}, ` : ''} orderBy: { direction: ASC, field: STARRED_AT }) {
            pageInfo { hasNextPage endCursor }
            edges { starredAt user:node { ...${ActorFragment.code} } }
          }
        `
      : '';

    return this;
  }

  includeWatchers(include = true, { after, first = 100 } = {}) {
    this._includeWatchers = include
      ? `
          watchers(${super.$argsToString({ after, first })}) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${ActorFragment.code} }
          }
        `
      : '';

    return this;
  }

  includeReleases(include = true, { after, first = 100, name = 'releases' } = {}) {
    const args = super.$argsToString({ after, first });

    this._includeReleases = include
      ? `
          ${name}:releases(${args}, orderBy: { field: CREATED_AT, direction: ASC  }) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${ReleaseFragment.code} }
          }
        `
      : '';

    return this;
  }

  includeTags(include = true, { after, first = 100 } = {}) {
    const args = super.$argsToString({ after, first });

    this._includeTags = include
      ? `
          tags:refs(refPrefix:"refs/tags/", ${args}, direction: ASC) {
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

  includeDependencyGraphManifests(include = true, { after, first = 100 } = {}) {
    this._includeDependencyGraphManifests = include
      ? `
          dependencyGraphManifests(${super.$argsToString({ after, first })}) {
            pageInfo { hasNextPage endCursor }
            nodes { id filename }
          }
        `
      : '';

    return this;
  }

  includeIssues(include = true, { after, first = 100 } = {}) {
    const args = super.$argsToString({ after, first });

    this._includeIssues = include
      ? `
          issues(${args}, orderBy: { field: UPDATED_AT, direction: ASC }) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${IssueFragment.code} }
          }
        `
      : '';

    return this;
  }

  includePullRequests(include = true, { after, first = 100 } = {}) {
    const args = super.$argsToString({ after, first });

    this._includePullRequests = include
      ? `
          pullRequests(${args}, orderBy: { field: UPDATED_AT, direction: ASC }) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${PullRequestFragment.code} }
          }
        `
      : '';

    return this;
  }

  toString() {
    return `
    ${this._name}:node(id: "${this.id}") {
      ${this._includeDetails}
      ... on Repository {
        ${this._includeLanguages}
        ${this._includeTopics}
        ${this._includeStargazers}
        ${this._includeWatchers}
        ${this._includeTags}
        ${this._includeReleases}
        ${this._includeDependencyGraphManifests}
        ${this._includeIssues}
        ${this._includePullRequests}
      }
    }
    `;
  }
};
