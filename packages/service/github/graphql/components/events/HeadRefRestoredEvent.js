const Fragment = require('../../Fragment');
const ActorFragment = require('../SimplifiedActorFragment');

module.exports = class HeadRefRestoredEvent extends Fragment {
  static get code() {
    return 'headRefRestoredEvent';
  }

  static get dependencies() {
    return [ActorFragment];
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
