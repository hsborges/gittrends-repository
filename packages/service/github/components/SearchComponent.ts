/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

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
  constructor(query?: Query, after?: string, first?: number) {
    super(null, 'search');
    this.includes.search = { textFragment: '', first, after, query: query ?? {} };
  }

  get fragments(): Fragment[] {
    return [SimplifiedRepositoryFragment];
  }

  toString(): string {
    const searchQuery = get(this.includes, 'search.query', {}) as Query;

    let query = `stars:${searchQuery.minStargazers ?? 0}..${searchQuery.maxStargazers ?? '*'}`;

    if (searchQuery.sort)
      query += ` sort:${searchQuery.sort}${searchQuery.order ? `-${searchQuery.order}` : ''}`;

    query += ' sort:stars-desc sort:forks-desc';

    if (searchQuery.language) query += ` language:${searchQuery.language}`;
    if (searchQuery.name) query += ` repo:${searchQuery.name}`;

    const args = super.argsToString({
      first: get(this.includes, 'search.first', 100),
      after: get(this.includes, 'search.after'),
      query
    });

    return `
      ${this.alias}:search(${args}, type: REPOSITORY) {
        pageInfo { hasNextPage endCursor }
        nodes { ...${SimplifiedRepositoryFragment.code} }
      }
    `;
  }
}
