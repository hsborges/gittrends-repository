const Fragment = require('../Fragment');
const CommentFragment = require('./CommentFragment');
const CommitFragment = require('./CommitFragment');
const ReactableFragment = require('./ReactableFragment');

module.exports = class PullRequestReviewCommentFragment extends Fragment {
  static get code() {
    return 'pullRequestReviewComment';
  }

  static get dependencies() {
    return [CommitFragment, CommentFragment, ReactableFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on PullRequestReviewComment {
        id
        type:__typename
        ... on Comment { ...${CommentFragment.code} }
        commit { ...${CommitFragment.code} }
        databaseId
        diffHunk
        draftedAt
        isMinimized
        minimizedReason
        originalCommit { ...${CommitFragment.code} }
        originalPosition
        outdated
        path
        position
        ...${ReactableFragment.code}
        replyTo { id }
        state
        url
      }
    `;
  }
};
