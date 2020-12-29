/*
 *  Author: Hudson S. Borges
 */
const Component = require('../Component');
const ActorFragment = require('../fragments/ActorFragment').simplified;

module.exports = class ReactionComponent extends Component {
  constructor(id, alias) {
    if (!id) throw new Error('ID or name (owner/name) is mandatory!');
    super();
    this.id = id;
    this.alias = alias || 'reactable';
    this._includeReactions = '';
  }

  get fragments() {
    return [ActorFragment];
  }

  static create({ id, alias }) {
    return new ReactionComponent(id, alias).includeReactions();
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
      ${this.alias}:node(id: "${this.id}") {
        type:__typename
        ${this._includeReactions}
      }
    `;
  }
};
