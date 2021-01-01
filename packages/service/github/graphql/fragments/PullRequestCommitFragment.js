/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../Fragment');
const CommitFragment = require('./CommitFragment');

module.exports = class PullRequestCommitFragment extends Fragment {
  static get code() {
    return 'pullRequestCommit';
  }

  static get dependencies() {
    return [CommitFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on PullRequestCommit {
        commit { ...${CommitFragment.code} }
      }
    `;
  }
};