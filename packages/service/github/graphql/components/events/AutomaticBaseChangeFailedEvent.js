const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class AutomaticBaseChangeFailedEvent extends Fragment {
  static get code() {
    return 'automaticBaseChangeFailedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on AutomaticBaseChangeFailedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        newBase
        oldBase
      }
    `;
  }
};
