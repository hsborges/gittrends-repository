const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class PinnedEvent extends Fragment {
  static get code() {
    return 'pinnedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on PinnedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
