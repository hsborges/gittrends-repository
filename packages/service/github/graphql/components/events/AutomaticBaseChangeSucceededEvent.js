const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class AutomaticBaseChangeSucceededEvent extends Fragment {
  static get code() {
    return 'automaticBaseChangeSucceededEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on AutomaticBaseChangeSucceededEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        newBase
        oldBase
      }
    `;
  }
};
