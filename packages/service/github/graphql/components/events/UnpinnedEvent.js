const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class UnpinnedEvent extends Fragment {
  static get code() {
    return 'unpinnedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on UnpinnedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
