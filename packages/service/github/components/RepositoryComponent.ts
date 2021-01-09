/*
 *  Author: Hudson S. Borges
 */
import Component from '../Component';
import Fragment from '../Fragment';
import RepositoryFragment from '../fragments/RepositoryFragment';
import { SimplifiedActorFragment } from '../fragments/ActorFragment';
import CommitFragment from '../fragments/CommitFragment';
import TagFragment from '../fragments/TagFragment';
import ReleaseFragment from '../fragments/ReleaseFragment';
import { SimplifiedIssueFragment } from '../fragments/IssueFragment';
import { SimplifiedPullRequest } from '../fragments/PullRequestFragment';

type TIncludes = Record<string, { include: boolean; textFragment: string }>;
type TIncludeOpts = { first: number; after?: string; alias?: string };

export default class RepositoryComponent extends Component {
  readonly id: string;
  readonly includes: TIncludes;

  constructor(id: string) {
    super('repository');
    this.id = id;

    this.includes = {
      dependencies: { include: false, textFragment: '' },
      details: { include: false, textFragment: '' },
      languages: { include: false, textFragment: '' },
      releases: { include: false, textFragment: '' },
      tags: { include: false, textFragment: '' },
      topics: { include: false, textFragment: '' },
      stargazers: { include: false, textFragment: '' },
      watchers: { include: false, textFragment: '' },
      issues: { include: false, textFragment: '' },
      pull_requests: { include: false, textFragment: '' }
    };
  }

  get fragments(): Fragment[] {
    const fragments: Set<Fragment> = new Set();

    if (this.includes.details.include) fragments.add(RepositoryFragment);
    if (this.includes.releases.include) fragments.add(ReleaseFragment);
    if (this.includes.stargazers.include) fragments.add(SimplifiedActorFragment);
    if (this.includes.tags.include) fragments.add(CommitFragment).add(TagFragment);
    if (this.includes.watchers.include) fragments.add(SimplifiedActorFragment);
    if (this.includes.issues.include) fragments.add(SimplifiedIssueFragment);
    if (this.includes.pull_requests.include) fragments.add(SimplifiedPullRequest);

    return [...fragments];
  }

  includeDetails(include = true): this {
    this.includes.details.include = include;
    this.includes.details.textFragment = include ? `...${RepositoryFragment.code}` : '';
    return this;
  }

  includeLanguages(include = true, { first, after, alias = 'languages' }: TIncludeOpts): this {
    this.includes.languages.include = include;
    this.includes.languages.textFragment = include
      ? `
        ${alias}:languages(${super.argsToString({ first, after })}) {
          pageInfo { hasNextPage endCursor }
          edges { language:node { name } size }
        }
      `
      : '';
    return this;
  }

  includeTopics(include = true, { first, after, alias = 'repositoryTopics' }: TIncludeOpts): this {
    this.includes.topics.include = include;
    this.includes.topics.textFragment = include
      ? `
        ${alias}:repositoryTopics(${super.argsToString({ first, after })}) {
          pageInfo { hasNextPage endCursor }
          nodes { topic { name } }
        }
      `
      : '';
    return this;
  }

  includeReleases(include = true, { first, after, alias = 'releases' }: TIncludeOpts): this {
    const args = super.argsToString({ first, after });
    this.includes.releases.include = include;
    this.includes.releases.textFragment = include
      ? `
        ${alias}:releases(${args}, orderBy: { field: CREATED_AT, direction: ASC  }) {
          pageInfo { hasNextPage endCursor }
          nodes { ...${ReleaseFragment.code} }
        }
      `
      : '';

    return this;
  }

  includeTags(include = true, { first, after, alias = 'tags' }: TIncludeOpts): this {
    const args = super.argsToString({ first, after });
    this.includes.tags.include = include;
    this.includes.tags.textFragment = include
      ? `
        ${alias}:refs(refPrefix:"refs/tags/", ${args}, direction: ASC) {
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

  includeStargazers(include = true, { first, after, alias = 'stargazers' }: TIncludeOpts): this {
    const args = super.argsToString({ first, after });
    this.includes.stargazers.include = include;
    this.includes.stargazers.textFragment = include
      ? `
        ${alias}:stargazers(${args}, orderBy: { direction: ASC, field: STARRED_AT }) {
            pageInfo { hasNextPage endCursor }
            edges { starredAt user:node { ...${SimplifiedActorFragment.code} } }
          }
      `
      : '';

    return this;
  }

  includeWatchers(include = true, { first, after, alias = 'watchers' }: TIncludeOpts): this {
    this.includes.watchers.include = include;
    this.includes.watchers.textFragment = include
      ? `
        ${alias}:watchers(${super.argsToString({ first, after })}) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${SimplifiedActorFragment.code} }
          }
      `
      : '';

    return this;
  }

  includeDependencyManifests(
    include = true,
    { first, after, alias = 'dependencyGraphManifests' }: TIncludeOpts
  ): this {
    this.includes.dependencies.include = include;
    this.includes.dependencies.textFragment = include
      ? `
        ${alias}:dependencyGraphManifests(${super.argsToString({ after, first })}) {
          pageInfo { hasNextPage endCursor }
          nodes { dependenciesCount exceedsMaxSize filename id parseable }
        }
      `
      : '';

    return this;
  }

  includeIssues(include = true, { after, first = 100, alias = '_issues' }: TIncludeOpts): this {
    const args = super.argsToString({ after, first });
    this.includes.issues.include = include;
    this.includes.issues.textFragment = include
      ? `
          ${alias}:issues(${args}, orderBy: { field: UPDATED_AT, direction: ASC }) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${SimplifiedIssueFragment.code} }
          }
        `
      : '';

    return this;
  }

  includePullRequests(
    include = true,
    { after, first = 100, alias = '_pullRequests' }: TIncludeOpts
  ): this {
    const args = super.argsToString({ after, first });
    this.includes.pull_requests.include = include;
    this.includes.pull_requests.textFragment = include
      ? `
          ${alias}:pullRequests(${args}, orderBy: { field: UPDATED_AT, direction: ASC }) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${SimplifiedPullRequest.code} }
          }
        `
      : '';

    return this;
  }

  toString(): string {
    let text = '';

    const textFragments = Object.values(this.includes)
      .filter((i) => i.include)
      .map((i) => i.textFragment)
      .join('\n');

    if (textFragments) {
      text += `
      ${this.alias}:node(id: "${this.id}") {
        ... on Repository {
          ${textFragments}
        }
      }
      `;
    }

    return text;
  }
}
