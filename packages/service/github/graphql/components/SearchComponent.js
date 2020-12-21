const Component = require('../Component');

const RepositoryFragment = require('./RepositoryFragment');

module.exports = class RepositoryComponent extends Component {
  constructor(name = 'search') {
    super();

    this._name = name;
    this._maxStargazers = null;
    this._language = null;
    this._after = null;
    this._first = 100;
  }

  get fragments() {
    return [new RepositoryFragment(false)];
  }

  static with({ name, maxStargazers, language, after, first }) {
    const component = new RepositoryComponent(name);
    component._maxStargazers = maxStargazers;
    component._language = language;
    component._after = after;
    component._first = first;
    return component;
  }

  toString() {
    let query = `stars:1..${this._maxStargazers || '*'} sort:stars-desc`;
    if (this._language) query += `language:${this._language}`;

    const args = super.$argsToString({ first: this._first, after: this._after, query });

    return `
      ${this._name}:search(${args}, type: REPOSITORY) {
        pageInfo { hasNextPage endCursor }
        nodes { ...${RepositoryFragment.code} }
      }
    `;
  }
};
