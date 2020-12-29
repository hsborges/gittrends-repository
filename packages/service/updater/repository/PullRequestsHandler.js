/*
 *  Author: Hudson S. Borges
 */
const IssuesHandler = require('./IssuesHandler');

module.exports = class RepositoryPullRequestsHander extends IssuesHandler {
  constructor(id, alias) {
    super(id, alias);
    this.batchSize = this.defaultBatchSize = 15;
    this.tlBatchSize = this.defaultTlBatchSize = 50;
    this.reactionsBatchSize = this.defaultReactionsBatchSize = 50;
  }

  static get type() {
    return 'PullRequests';
  }

  static get IssueComponent() {
    return require('../../github/graphql/components/PullRequestComponent');
  }
};
