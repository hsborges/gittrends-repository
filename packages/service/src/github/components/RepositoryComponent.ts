/*
 *  Author: Hudson S. Borges
 */
import Component from '../Component';
import Fragment from '../Fragment';
import RepositoryFragment from '../fragments/RepositoryFragment';
import { SimplifiedActorFragment } from '../fragments/ActorFragment';

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
      topics: { include: false, textFragment: '' },
      stargazers: { include: false, textFragment: '' }
    };
  }

  get fragments(): Fragment[] {
    const fragments: Fragment[] = [];

    if (this.includes.details.include) fragments.push(RepositoryFragment);
    if (this.includes.stargazers.include) fragments.push(SimplifiedActorFragment);

    return fragments;
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
