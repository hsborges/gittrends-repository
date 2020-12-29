/*
 *  Author: Hudson S. Borges
 */
const Component = require('../github/graphql/Component.js');
const compact = require('../helpers/compact.js');
const dao = require('./dao');

module.exports = class Handler {
  constructor(component) {
    if (!component || !(component instanceof Component)) throw new Error('Component is mandatory!');

    this.component = component;
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
