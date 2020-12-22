const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class UserBlockedEvent extends Fragment {
  static get code() {
    return 'userBlockedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on UserBlockedEvent {
        actor { ...${ActorFragment.code} }
        blockDuration
        createdAt
        subject { ...${ActorFragment.code} }
      }
    `;
  }
};
