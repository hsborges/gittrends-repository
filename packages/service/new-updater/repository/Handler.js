const compact = require('../../helpers/compact.js');
const dao = require('../../updater/helper/dao');

module.exports = class Handler {
  constructor() {
    this.compact = compact;
    this.dao = dao;
  }

  async updateComponent() {
    throw new Error('Handler.updateComponent() must be override!');
  }

  async updateDatabase(response) {
    throw new Error('Handler.updateDatabase() must be override!');
  }

  get hasNextPage() {
    throw new Error('Handler.hasNextPage() must be override!');
  }

  get done() {
    return !this.hasNextPage;
  }
};
