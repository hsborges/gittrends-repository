/*
 *  Author: Hudson S. Borges
 */
import Component from '../Component';
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from '../fragments/ActorFragment';
import CommitFragment from '../fragments/CommitFragment';
import { SimplifiedIssueFragment } from '../fragments/IssueFragment';
import { SimplifiedPullRequest } from '../fragments/PullRequestFragment';
import ReleaseFragment from '../fragments/ReleaseFragment';
import RepositoryFragment from '../fragments/RepositoryFragment';
import TagFragment from '../fragments/TagFragment';

type TIncludeOpts = { first: number; after?: string; alias?: string };

export default class RepositoryComponent extends Component {
  constructor(id: string) {
    super(id, 'repository');
  }

  get fragments(): Fragment[] {
    const fragments: Set<Fragment> = new Set();

    if (this.includes.details) fragments.add(RepositoryFragment);
    if (this.includes.releases) fragments.add(ReleaseFragment);
    if (this.includes.stargazers) fragments.add(SimplifiedActorFragment);
    if (this.includes.tags) fragments.add(CommitFragment).add(TagFragment);
    if (this.includes.watchers) fragments.add(SimplifiedActorFragment);
    if (this.includes.issues) fragments.add(SimplifiedIssueFragment);
    if (this.includes.pull_requests) fragments.add(SimplifiedPullRequest);

    return [...fragments];
  }

  includeDetails(include = true): this {
    this.includes.details = include && { textFragment: `...${RepositoryFragment.code}` };
    return this;
  }

  includeLanguages(include = true, { first, after, alias = 'languages' }: TIncludeOpts): this {
    this.includes.languages = include && {
      textFragment: `
        ${alias}:languages(${super.argsToString({ first, after })}) {
          pageInfo { hasNextPage endCursor }
          edges { language:node { name } size }
        }
      `,
      first,
      after
    };
    return this;
  }

  includeTopics(include = true, { first, after, alias = 'repositoryTopics' }: TIncludeOpts): this {
    this.includes.topics = include && {
      textFragment: `
        ${alias}:repositoryTopics(${super.argsToString({ first, after })}) {
          pageInfo { hasNextPage endCursor }
          nodes { topic { name } }
        }
      `,
      first,
      after
    };
    return this;
  }

  includeReleases(include = true, { first, after, alias = 'releases' }: TIncludeOpts): this {
    const args = super.argsToString({ first, after });
    this.includes.releases = include && {
      textFragment: `
        ${alias}:releases(${args}, orderBy: { field: CREATED_AT, direction: ASC  }) {
          pageInfo { hasNextPage endCursor }
          nodes { ...${ReleaseFragment.code} }
        }
      `,
      first,
      after
    };
    return this;
  }

  includeTags(include = true, { first, after, alias = 'tags' }: TIncludeOpts): this {
    const args = super.argsToString({ first, after });
    this.includes.tags = include && {
      textFragment: `
        ${alias}:refs(refPrefix:"refs/tags/", ${args}, direction: ASC) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id name
            target { type:__typename id oid ...${CommitFragment.code} ...${TagFragment.code} }
          }
        }
      `,
      first,
      after
    };

    return this;
  }

  includeStargazers(include = true, { first, after, alias = 'stargazers' }: TIncludeOpts): this {
    const args = super.argsToString({ first, after });
    this.includes.stargazers = include && {
      textFragment: `
        ${alias}:stargazers(${args}, orderBy: { direction: ASC, field: STARRED_AT }) {
            pageInfo { hasNextPage endCursor }
            edges { starredAt user:node { ...${SimplifiedActorFragment.code} } }
          }
      `,
      first,
      after
    };

    return this;
  }

  includeWatchers(include = true, { first, after, alias = 'watchers' }: TIncludeOpts): this {
    this.includes.watchers = include && {
      textFragment: `
        ${alias}:watchers(${super.argsToString({ first, after })}) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${SimplifiedActorFragment.code} }
          }
      `,
      first,
      after
    };

    return this;
  }

  includeDependencyManifests(
    include = true,
    { first, after, alias = 'dependency_graph_manifests' }: TIncludeOpts
  ): this {
    this.includes.dependencies = include && {
      textFragment: `
        ${alias}:dependencyGraphManifests(${super.argsToString({ after, first })}) {
          pageInfo { hasNextPage endCursor }
          nodes { dependenciesCount exceedsMaxSize filename id parseable }
        }
      `,
      first,
      after
    };

    return this;
  }

  includeIssues(include = true, { after, first = 100, alias = '_issues' }: TIncludeOpts): this {
    const args = super.argsToString({ after, first });
    this.includes.issues = include && {
      textFragment: `
        ${alias}:issues(${args}, orderBy: { field: UPDATED_AT, direction: ASC }) {
          pageInfo { hasNextPage endCursor }
          nodes { ...${SimplifiedIssueFragment.code} }
        }
      `,
      first,
      after
    };

    return this;
  }

  includePullRequests(
    include = true,
    { after, first = 100, alias = '_pullRequests' }: TIncludeOpts
  ): this {
    const args = super.argsToString({ after, first });
    this.includes.pull_requests = include && {
      textFragment: `
        ${alias}:pullRequests(${args}, orderBy: { field: UPDATED_AT, direction: ASC }) {
          pageInfo { hasNextPage endCursor }
          nodes { ...${SimplifiedPullRequest.code} }
        }
      `,
      first,
      after
    };

    return this;
  }

  toString(): string {
    let text = '';

    const textFragments = Object.values(this.includes)
      .filter((i) => i)
      .map((i) => i && i.textFragment)
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
