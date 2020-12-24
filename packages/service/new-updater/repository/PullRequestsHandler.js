const IssuesHandler = require('./IssuesHandler');

module.exports = class RepositoryPullRequestsHander extends IssuesHandler {
  static get type() {
    return 'PullRequests';
  }
};
