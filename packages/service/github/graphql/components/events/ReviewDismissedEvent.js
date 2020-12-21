const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment');
const CommitFragment = require('../CommitFragment');

module.exports = class ReviewDismissedEvent extends Fragment {
  static get code() {
    return 'reviewDismissedEvent';
  }

  static get dependencies() {
    return [ActorFragment.simplified];
  }

  static toString() {
    return `
      fragment ${this.code} on ReviewDismissedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        databaseId
        dismissalMessage
        previousReviewState
        pullRequestCommit { id commit { ...${CommitFragment.code} } url }
        review { id }
        url
      }
    `;
  }
};
