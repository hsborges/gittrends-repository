/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../Fragment');
const CommitFragment = require('./CommitFragment');
const CommitCommentFragment = require('./CommitCommentFragment');

module.exports = class PullRequestCommitCommentThreadFragment extends Fragment {
  static get code() {
    return 'pullRequestCommitCommentThread';
  }

  static get dependencies() {
    return [CommitFragment, CommitCommentFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on PullRequestCommitCommentThread {
        comments(first: 100) { nodes { ...${CommitCommentFragment.code} } }
        commit { ...${CommitFragment.code} }
        path
        position
      }
    `;
  }
};
