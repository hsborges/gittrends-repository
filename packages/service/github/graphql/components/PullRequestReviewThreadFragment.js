const Fragment = require('../Fragment');
const ActorFragment = require('./SimplifiedActorFragment');
const PullRequestReviewCommentFragment = require('./PullRequestReviewCommentFragment');

module.exports = class PullRequestReviewThreadFragment extends Fragment {
  static get code() {
    return 'pullRequestReviewThread';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on PullRequestReviewThread {
        isResolved
        resolvedBy { ...${ActorFragment.code} }
        comments(first: 100) { nodes { ...${PullRequestReviewCommentFragment.code} } }
      }
    `;
  }
};
