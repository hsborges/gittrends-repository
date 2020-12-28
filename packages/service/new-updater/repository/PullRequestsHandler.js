const IssuesHandler = require('./IssuesHandler');

module.exports = class RepositoryPullRequestsHander extends IssuesHandler {
  static get type() {
    return 'PullRequests';
  }

  static get IssueComponent() {
    return require('../../github/graphql/components/PullRequestComponent');
  }
};
