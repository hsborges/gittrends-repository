/*
 *  Author: Hudson S. Borges
 */
const IssuesHandler = require('./IssuesHandler');

module.exports = class RepositoryPullRequestsHander extends IssuesHandler {
  constructor(id, alias) {
    super(id, alias);
    this.batchSize = this.defaultBatchSize = 10;
  }

  static get type() {
    return 'PullRequests';
  }

  static get IssueComponent() {
    return require('../../github/graphql/components/PullRequestComponent');
  }
};
