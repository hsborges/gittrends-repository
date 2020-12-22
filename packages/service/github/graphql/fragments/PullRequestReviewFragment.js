const Fragment = require('../Fragment');
const ActorFragment = require('./ActorFragment').simplified;
const PullRequestReviewCommentFragment = require('./PullRequestReviewCommentFragment');
const CommitFragment = require('./CommitFragment');
const ReactableFragment = require('./ReactableFragment');

module.exports = class PullRequestReviewFragment extends Fragment {
  static get code() {
    return 'pullRequestReview';
  }

  static get dependencies() {
    return [CommitFragment, ReactableFragment, PullRequestReviewCommentFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on PullRequestReview {
        type:__typename
        author { ...${ActorFragment.code} }
        authorAssociation
        body
        comments(first: 100) { nodes { ...${PullRequestReviewCommentFragment.code} } }
        commit { ...${CommitFragment.code} }
        createdAt
        createdViaEmail
        databaseId
        editor { ...${ActorFragment.code} }
        lastEditedAt
        publishedAt
        ...${ReactableFragment.code}
        state
        submittedAt
        updatedAt
        url
      }
    `;
  }
};
