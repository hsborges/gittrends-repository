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

type TIncludes = Record<string, { include: boolean; textFragment: string }>;
type TIncludeOpts = { first: number; after?: string; alias?: string };

export default class RepositoryComponent extends Component {
  readonly id: string;
  readonly includes: TIncludes;

  constructor(id: string) {
    super('repository');
    this.id = id;

    this.includes = {
      details: { include: false, textFragment: '' },
      languages: { include: false, textFragment: '' },
      releases: { include: false, textFragment: '' },
      tags: { include: false, textFragment: '' },
      topics: { include: false, textFragment: '' },
      stargazers: { include: false, textFragment: '' },
      watchers: { include: false, textFragment: '' }
    };
  }

  get fragments(): Fragment[] {
    const fragments: Set<Fragment> = new Set();

    if (this.includes.details.include) fragments.add(RepositoryFragment);
    if (this.includes.releases.include) fragments.add(ReleaseFragment);
    if (this.includes.stargazers.include) fragments.add(SimplifiedActorFragment);
    if (this.includes.tags.include) fragments.add(CommitFragment).add(TagFragment);
    if (this.includes.watchers.include) fragments.add(SimplifiedActorFragment);

    return [...fragments];
  }

  includeDetails(include = true): this {
    this.includes.details.include = include;
    if (include) this.includes.details.textFragment = `...${RepositoryFragment.code}`;
    return this;
  }

  includeLanguages(include = true, { first, after, alias = 'languages' }: TIncludeOpts): this {
    this.includes.languages.include = include;
    if (include)
      this.includes.languages.textFragment = `
        ${alias}:languages(${super.argsToString({ first, after })}) {
          pageInfo { hasNextPage endCursor }
          edges { language:node { name } size }
        }
      `;
    return this;
  }

  includeTopics(include = true, { first, after, alias = 'repositoryTopics' }: TIncludeOpts): this {
    this.includes.topics.include = include;
    if (include)
      this.includes.topics.textFragment = `
        ${alias}:repositoryTopics(${super.argsToString({ first, after })}) {
          pageInfo { hasNextPage endCursor }
          nodes { topic { name } }
        }
      `;
    return this;
  }

  includeReleases(include = true, { first, after, alias = 'releases' }: TIncludeOpts): this {
    this.includes.releases.include = include;
    if (include) {
      const args = super.argsToString({ first, after });
      this.includes.releases.textFragment = `
        ${alias}:releases(${args}, orderBy: { field: CREATED_AT, direction: ASC  }) {
          pageInfo { hasNextPage endCursor }
          nodes { ...${ReleaseFragment.code} }
        }
      `;
    }
    return this;
  }

  includeTags(include = true, { first, after, alias = 'tags' }: TIncludeOpts): this {
    this.includes.tags.include = include;
    if (include) {
      const args = super.argsToString({ first, after });
      this.includes.tags.textFragment = `
        ${alias}:refs(refPrefix:"refs/tags/", ${args}, direction: ASC) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id name
            target { type:__typename id oid ...${CommitFragment.code} ...${TagFragment.code} }
          }
        }
      `;
    }
    return this;
  }

  includeStargazers(include = true, { first, after, alias = 'stargazers' }: TIncludeOpts): this {
    this.includes.stargazers.include = include;
    if (include) {
      const args = super.argsToString({ first, after });
      this.includes.stargazers.textFragment = `
        ${alias}:stargazers(${args}, orderBy: { direction: ASC, field: STARRED_AT }) {
            pageInfo { hasNextPage endCursor }
            edges { starredAt user:node { ...${SimplifiedActorFragment.code} } }
          }
      `;
    }
    return this;
  }

  includeWatchers(include = true, { first, after, alias = 'watchers' }: TIncludeOpts): this {
    this.includes.watchers.include = include;
    if (include) {
      this.includes.watchers.textFragment = `
        ${alias}:watchers(${super.argsToString({ first, after })}) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${SimplifiedActorFragment.code} }
          }
      `;
    }
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
