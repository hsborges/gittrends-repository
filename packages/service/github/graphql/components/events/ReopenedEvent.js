const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class ReopenedEvent extends Fragment {
  static get code() {
    return 'reopenedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on ReopenedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
