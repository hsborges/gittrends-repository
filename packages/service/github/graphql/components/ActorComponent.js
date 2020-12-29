/*
 *  Author: Hudson S. Borges
 */
const Component = require('../Component');
const ActorFragment = require('../fragments/ActorFragment');

module.exports = class ActorComponent extends Component {
  constructor(id, alias) {
    if (!id) throw new Error('ID or name (owner/name) is mandatory!');

    super();
    this.id = id;
    this.alias = alias || 'actor';
  }

  get fragments() {
    return [ActorFragment];
  }

  static create({ id, alias }) {
    return new ActorComponent(id, alias);
  }

  toString() {
    return `
      ${this.alias}:node(id: "${this.id}") {
        ...${ActorFragment.code}
      }
    `;
  }
};
