const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class HeadRefRestoredEvent extends Fragment {
  static get code() {
    return 'headRefRestoredEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on HeadRefRestoredEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
