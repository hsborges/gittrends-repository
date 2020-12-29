/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../Fragment');
const ActorFragment = require('./ActorFragment').simplified;
const PullRequestReviewCommentFragment = require('./PullRequestReviewCommentFragment');

module.exports = class PullRequestReviewThreadFragment extends Fragment {
  static get code() {
    return 'pullRequestReviewThread';
  }

  static get dependencies() {
    return [ActorFragment, PullRequestReviewCommentFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on PullRequestReviewThread {
        diffSide
        isCollapsed
        isOutdated
        isResolved
        line
        originalLine
        originalStartLine
        path
        startDiffSide
        startLine
        resolvedBy { ...${ActorFragment.code} }
        comments(first: 100) { nodes { ...${PullRequestReviewCommentFragment.code} } }
      }
    `;
  }
};
