/*
 *  Author: Hudson S. Borges
 */
import Component from '../Component';
import Fragment from '../Fragment';
import { SimplifiedRepositoryFragment } from '../fragments/RepositoryFragment';

type Query = {
  minStargazers?: number;
  maxStargazers?: number;
  language?: string;
  name?: string;
  sort?: 'stars' | 'created' | 'updated' | undefined;
  order?: 'asc' | 'desc' | undefined;
};

export default class SearchComponent extends Component {
  private after: string | undefined;
  private first = 100;
  private query: Query;

  constructor(query?: Query, after?: string, first?: number) {
    super('search');
    this.query = query ?? {};
    this.after = after;
    this.first = first || this.first;
  }

  get fragments(): Fragment[] {
    return [SimplifiedRepositoryFragment];
  }

  toString(): string {
    let query = `stars:${this.query.minStargazers ?? 0}..${this.query.maxStargazers ?? '*'}`;

    if (this.query.sort)
      query += ` sort:${this.query.sort}${this.query.order ? `-${this.query.order}` : ''}`;

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
