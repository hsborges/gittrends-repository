const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class UnlockedEvent extends Fragment {
  static get code() {
    return 'unlockedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on UnlockedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
