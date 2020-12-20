const PullRequestFragment = require('./PullRequestFragment');
const ActorFragment = require('./SimplifiedActorFragment');
const IssueFragment = require('./IssueFragment');

module.exports = class SimplifiedPullRequestFragment extends PullRequestFragment {
  static get code() {
    return 'simplifiedPullRequest';
  }

  static get dependencies() {
    return IssueFragment.dependencies.concat([ActorFragment]);
  }

  static toString() {
    return super.toString(false);
  }
};
