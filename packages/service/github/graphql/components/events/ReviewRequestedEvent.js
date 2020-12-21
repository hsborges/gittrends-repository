const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class ReviewRequestedEvent extends Fragment {
  static get code() {
    return 'reviewRequestedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on ReviewRequestedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        requestedReviewer { ...${ActorFragment.code} }
      }
    `;
  }
};
