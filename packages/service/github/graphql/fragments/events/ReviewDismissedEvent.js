/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../../Fragment');
const ActorFragment = require('../ActorFragment').simplified;
const PullRequestCommitFragment = require('../PullRequestCommitFragment');

module.exports = class ReviewDismissedEvent extends Fragment {
  static get code() {
    return 'reviewDismissedEvent';
  }

  static get dependencies() {
    return [ActorFragment, PullRequestCommitFragment];
  }

  static toString() {
    return `
      fragment ${this.code || this.constructor.code} on ReviewDismissedEvent {
        actor { ...${ActorFragment.code} }
        createdAt
        databaseId
        dismissalMessage
        previousReviewState
        pullRequestCommit { ...${PullRequestCommitFragment.code} }
        review { id }
        url
      }
    `;
  }
};
