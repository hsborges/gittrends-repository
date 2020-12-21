const Component = require('../Component');
const ActorFragment = require('./ActorFragment');

module.exports = class ReactionComponent extends Component {
  constructor(id, name) {
    if (!id) throw new Error('ID or name (owner/name) is mandatory!');
    super();
    this._id = id;
    this._name = name || 'reactable';
    this._includeReactions = '';
  }

  get fragments() {
    return [ActorFragment.simplified];
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  static with({ id, name }) {
    return new ReactionComponent(id, name).includeReactions();
  }

  includeReactions(include = true, { first = 100, after } = {}) {
    const args = super.$argsToString({ first, after });
    this._includeReactions = include
      ? `
      ... on Reactable {
        reactions(${args}, orderBy: { field: CREATED_AT, direction: ASC }) {
          pageInfo { hasNextPage endCursor }
          nodes { content createdAt id user { ...${ActorFragment.code} } }
        }
      }
    `
      : '';

    return this;
  }

  toString() {
    return `
      ${this._name}:node(id: "${this._id}") {
        type:__typename
        ${this._includeReactions}
      }
    `;
  }
};
