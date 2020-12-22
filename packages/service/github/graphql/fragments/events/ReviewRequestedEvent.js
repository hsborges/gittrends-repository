const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;

module.exports = class ReviewRequestedEvent extends Fragment {
  static get code() {
    return 'reviewRequestedEvent';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on ReviewRequestedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        requestedReviewer { ...${ActorFragment.code} }
      }
    `;
  }
};
