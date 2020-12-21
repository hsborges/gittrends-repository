const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class UnsubscribedEvent extends Fragment {
  static get code() {
    return 'unsubscribedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on UnsubscribedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
