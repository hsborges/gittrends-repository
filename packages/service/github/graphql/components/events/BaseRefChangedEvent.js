const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class BaseRefChangedEvent extends Fragment {
  static get code() {
    return 'baseRefChangedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on BaseRefChangedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
