const Fragment = require('../../Fragment');
const ActorFragment = require('../SimplifiedActorFragment');

module.exports = class UnpinnedEvent extends Fragment {
  static get code() {
    return 'unpinnedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
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
