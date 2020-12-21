const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class UserBlockedEvent extends Fragment {
  static get code() {
    return 'userBlockedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on UserBlockedEvent {
        actor { ...${ActorFragment.code} }
        blockDuration
        createdAt
        subject { ...${ActorFragment.code} }
      }
    `;
  }
};
