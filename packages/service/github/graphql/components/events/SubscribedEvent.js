const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class SubscribedEvent extends Fragment {
  static get code() {
    return 'subscribedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on SubscribedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
