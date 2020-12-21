const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');

module.exports = class ReviewRequestRemovedEvent extends Fragment {
  static get code() {
    return 'reviewRequestRemovedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on ReviewRequestRemovedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        requestedReviewer { ...${ActorFragment.code} }
      }
    `;
  }
};
