/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../Fragment');
const CommitFragment = require('./CommitFragment');

module.exports = class PullRequestRevisionMarkerFragment extends Fragment {
  static get code() {
    return 'pullRequestRevisionMarker';
  }

  static get dependencies() {
    return [CommitFragment];
  }

  static toString() {
    return `
      fragment ${this.code} on PullRequestRevisionMarker {
        createdAt
        lastSeenCommit { ...${CommitFragment.code} }
      }
    `;
  }
};
