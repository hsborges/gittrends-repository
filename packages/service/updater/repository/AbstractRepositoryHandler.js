/*
 *  Author: Hudson S. Borges
 */
const Handler = require('../Handler');
const RepositoryComponent = require('../../github/graphql/components/RepositoryComponent');

module.exports = class AbstractRepositoryHandler extends Handler {
  constructor(id, alias) {
    super(RepositoryComponent.create({ id, alias }).includeDetails(false));
    this.batchSize = this.defaultBatchSize = 100;
  }

  error(_err) {
    throw new Error('AbstractRepositoryHandler.error() must be override!');
  }

  get repositoryId() {
    return this.component.id;
  }

  get alias() {
    return this.component.alias;
  }
};
