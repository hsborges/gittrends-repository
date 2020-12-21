const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class LockedEvent extends Fragment {
  static get code() {
    return 'lockedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on LockedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        lockReason
      }
    `;
  }
};
