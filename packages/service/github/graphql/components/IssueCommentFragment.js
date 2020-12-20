const Fragment = require('../../Fragment');
const ReactableFragment = require('./ReactableFragment');
const CommentFragment = require('./CommentFragment');

module.exports = class IssueCommentFragment extends Fragment {
  static get code() {
    return 'issueCommentFragment';
  }

  static get dependencies() {
    return [ReactableFragment, CommentFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on IssueComment {
        ...${CommentFragment.code}
        lastEditedAt
        publishedAt
        isMinimized
        minimizedReason
        ...${ReactableFragment.code}
      }
    `;
  }
};
