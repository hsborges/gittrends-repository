const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class AutomaticBaseChangeSucceededEvent extends Fragment {
  static get code() {
    return 'automaticBaseChangeSucceededEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on AutomaticBaseChangeSucceededEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        newBase
        oldBase
      }
    `;
  }
};
