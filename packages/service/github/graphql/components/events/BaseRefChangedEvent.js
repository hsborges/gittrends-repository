const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class BaseRefChangedEvent extends Fragment {
  static get code() {
    return 'baseRefChangedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
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
