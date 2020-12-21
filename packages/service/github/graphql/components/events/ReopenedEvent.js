const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class ReopenedEvent extends Fragment {
  static get code() {
    return 'reopenedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on ReopenedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
