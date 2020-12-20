const Fragment = require('../../Fragment');
const ActorFragment = require('../SimplifiedActorFragment');

module.exports = class LockedEvent extends Fragment {
  static get code() {
    return 'lockedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
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
