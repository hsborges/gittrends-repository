/*
 *  Author: Hudson S. Borges
 */
const Component = require('../Component');
const RepositoryFragment = require('../fragments/RepositoryFragment');

module.exports = class SearchComponent extends Component {
  constructor(name = 'search') {
    super();
    this.name = name;
    this.after = null;
    this.first = 100;
    this.query = { maxStargazers: null, language: null, name: null };
  }

  get fragments() {
    return [new RepositoryFragment(false)];
  }

  static create({ name, query: { maxStargazers, language, name: _name }, after, first } = {}) {
    const component = new SearchComponent(name);
    component.query.maxStargazers = maxStargazers;
    component.query.language = language;
    component.query.name = _name;
    component.after = after;
    component.first = first;
    return component;
  }

  toString() {
    let query = `stars:1..${this.query.maxStargazers || '*'} sort:stars-desc`;
    if (this.query.language) query += ` language:${this.query.language}`;
    if (this.query.name) query += ` repo:${this.query.name}`;

    const args = super.$argsToString({ first: this.first, after: this.after, query });

    return `
      ${this.name}:search(${args}, type: REPOSITORY) {
        pageInfo { hasNextPage endCursor }
        nodes { ...${RepositoryFragment.code} }
      }
    `;
  }
};
