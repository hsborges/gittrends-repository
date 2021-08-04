/*
 *  Author: Hudson S. Borges
 */
import Component from '../Component';
import Fragment from '../Fragment';
import { SimplifiedRepositoryFragment } from '../fragments/RepositoryFragment';

type Query = { minStargazers?: number; maxStargazers?: number; language?: string; name?: string };

export default class SearchComponent extends Component {
  private after: string | undefined;
  private first = 100;
  private query: Query = {};

  constructor(query?: Query, after?: string, first?: number) {
    super('search');
    this.query.minStargazers = query?.minStargazers;
    this.query.maxStargazers = query?.maxStargazers;
    this.query.language = query?.language;
    this.query.name = query?.name;
    this.after = after;
    this.first = first || this.first;
  }

  get fragments(): Fragment[] {
    return [SimplifiedRepositoryFragment];
  }

  toString(): string {
    let { minStargazers, maxStargazers } = this.query;
    let query = `stars:${minStargazers ?? 1}..${maxStargazers ?? '*'} sort:stars-desc`;
    if (this.query.language) query += ` language:${this.query.language}`;
    if (this.query.name) query += ` repo:${this.query.name}`;

    const args = super.argsToString({ first: this.first, after: this.after, query });

    return `
      ${this.alias}:search(${args}, type: REPOSITORY) {
        pageInfo { hasNextPage endCursor }
        nodes { ...${SimplifiedRepositoryFragment.code} }
      }
    `;
  }
}
