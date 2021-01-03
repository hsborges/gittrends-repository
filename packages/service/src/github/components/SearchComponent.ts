/*
 *  Author: Hudson S. Borges
 */
import Component from '../Component';
import Fragment from '../Fragment';
import { SimplifiedRepositoryFragment } from '../fragments/RepositoryFragment';

type Query = { maxStargazers?: number; language?: string; name?: string };

export default class SearchComponent extends Component {
  private after: string | undefined;
  private first = 100;
  private query: Query = {};

  constructor(alias = 'search') {
    super(alias);
  }

  get fragments(): Fragment[] {
    return [SimplifiedRepositoryFragment];
  }

  static create(name: string, query?: Query, after?: string, first?: number): SearchComponent {
    const component = new SearchComponent(name);
    component.query.maxStargazers = query?.maxStargazers;
    component.query.language = query?.language;
    component.query.name = query?.name;
    component.after = after;
    component.first = first || component.first;
    return component;
  }

  toString(): string {
    let query = `stars:1..${this.query.maxStargazers || '*'} sort:stars-desc`;
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
