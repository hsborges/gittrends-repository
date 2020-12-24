const Handler = require('../Handler');
const RepositoryComponent = require('../../github/graphql/components/RepositoryComponent');

module.exports = class AbstractRepositoryHandler extends Handler {
  constructor(id, alias) {
    super(new RepositoryComponent(id, alias));
  }

  get repositoryId() {
    return this.component.id;
  }

  get alias() {
    return this.component.alias;
  }
};
