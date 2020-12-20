const Fragment = require('../../Fragment');
const ActorFragment = require('../SimplifiedActorFragment');

module.exports = class ReadyForReviewEvent extends Fragment {
  static get code() {
    return 'readyForReviewEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on ReadyForReviewEvent {
        actor { ...${ActorFragment.code} }
        createdAt
      }
    `;
  }
};
