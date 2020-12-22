const Component = require('../Component');
const ActorFragment = require('../fragments/ActorFragment');

module.exports = class ActorComponent extends Component {
  constructor(id, name) {
    if (!id) throw new Error('ID or name (owner/name) is mandatory!');

    super();

    this._id = id;
    this._name = name || 'actor';
  }

  get fragments() {
    return [ActorFragment];
  }

  static with({ id, name }) {
    return new ActorComponent(id, name);
  }

  toString() {
    return `
      ${this._name}:node(id: "${this._id}") {
        ...${ActorFragment.code}
      }
    `;
  }
};
