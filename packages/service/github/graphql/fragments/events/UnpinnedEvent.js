const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class UnpinnedEvent extends Fragment {
  static get code() {
    return 'unpinnedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on UnpinnedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
