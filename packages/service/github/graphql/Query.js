const { get } = require('lodash');
const parser = require('./parser.js');
const client = require('./graphql-client.js');

const Component = require('./Component');

function getGraphQLType(key) {
  switch (typeof key) {
    case 'number':
      return 'Int';
    case 'boolean':
      return 'Boolean';
    default:
      return 'String';
  }
}

module.exports = class Query {
  constructor(args = {}) {
    this.components = [];
    this._args = Object.assign({}, args);
  }

  static withArgs(args) {
    return new Query(args);
  }

  compose(component) {
    if (!(component instanceof Component)) throw new Error('Invalid component!');
    this.components.push(component);
    return this;
  }

  get fragments() {
    const fragments = new Set();
    this.components.forEach((c) => c.fragments.forEach((f) => fragments.add(f)));

    (function recursive(_fragments) {
      if (!_fragments.length) return;
      const dependencies = _fragments.reduce((acc, f) => acc.concat(f.dependencies), []);
      dependencies.map((f) => fragments.add(f));
      return recursive(dependencies);
    })([...fragments]);

    return [...fragments];
  }

  get args() {
    const keys = Object.keys(this._args);

    if (!keys.length) return '';

    const _args = keys
      .map(
        (k) => `$${k}:${getGraphQLType(this._args[k])} ${this._args[k] ? `= ${this._args[k]}` : ''}`
      )
      .join(', ')
      .replace(/\s+/g, ' ')
      .replace(/\s,/g, ',');

    return `(${_args})`;
  }

  set args(value) {
    this._args = Object.assign({}, this._args, value);
  }

  toString() {
    return `
    query${this.args} {
      ${this.components.map((c) => c.toString()).join('\n')}
    }\n
    ${this.fragments.map((f) => f.toString()).join('\n')}
    `
      .split(/[\n\r]/g)
      .filter((r) => r.trim().length)
      .join('\n')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async run() {
    const response = await client.post({ query: this.toString() });
    return parser(get(response, 'data.data', null));
  }
};
