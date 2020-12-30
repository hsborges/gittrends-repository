/*
 *  Author: Hudson S. Borges
 */
const Handler = require('../Handler');
const RepositoryComponent = require('../../github/graphql/components/RepositoryComponent');

const { ResourceUpdateError } = require('../../helpers/errors');

module.exports = class AbstractRepositoryHandler extends Handler {
  constructor(id, alias) {
    super(RepositoryComponent.create({ id, alias }).includeDetails(false));
    this.batchSize = this.defaultBatchSize = 50;
  }

  error(err) {
    console.error(err);
    throw new ResourceUpdateError(err.message, err);
  }

  get repositoryId() {
    return this.component.id;
  }

  get alias() {
    return this.component.alias;
  }
};
