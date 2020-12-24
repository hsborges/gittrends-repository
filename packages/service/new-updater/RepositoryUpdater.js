const { snakeCase, pick } = require('lodash');
const { knex } = require('@gittrends/database-config');

const { actors: ActorsDAO, commits: CommitsDAO } = require('../updater/helper/dao');
const { BadGatewayError } = require('../helpers/errors');

const Updater = require('./Updater');
const Query = require('../github/graphql/Query');

module.exports = class RepositoryUpdater extends Updater {
  constructor(id, handlers = []) {
    if (!id || !handlers || !handlers.length)
      throw new Error('Repository ID and handlers are mandatory!');

    super();
    this.id = id;
    this.handlers = handlers.map((Handler) => new Handler(id, snakeCase(Handler.name)));
  }

  async $update(handlers) {
    return await Query.create()
      .compose(...handlers.filter((handler) => !handler.done).map((handler) => handler.component))
      .then(({ data, users = [], commits = [] }) =>
        knex.transaction((trx) =>
          Promise.all([
            ActorsDAO.insert(users, trx),
            CommitsDAO.insert(commits, trx),
            Promise.map(this.handlers, (handler) =>
              handler.updateDatabase(pick(data, handler.alias), trx)
            )
          ])
        )
      )
      .catch((err) => {
        if (err instanceof BadGatewayError) {
          if (handlers.length > 1)
            return Promise.map(handlers, (handler) => this.$update([handler]));
        }
        throw err;
      });
  }

  async update() {
    while (this.hasNextPage) {
      // prepare all handlers
      await Promise.map(this.handlers, (handler) => handler.updateComponent());
      // run queries and update handlers
      await this.$update(this.handlers);
    }
  }

  get hasNextPage() {
    return this.handlers.reduce((acc, h) => acc || h.hasNextPage, false);
  }
};
