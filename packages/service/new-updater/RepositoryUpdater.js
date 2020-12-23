const { knex } = require('@gittrends/database-config');
const { actors: ActorsDAO } = require('../updater/helper/dao');

const Query = require('../github/graphql/Query');
const RepositoryComponent = require('../github/graphql/components/RepositoryComponent');
const DetailsHander = require('./repository/DetailsHandler');

module.exports = class RepositoryUpdater {
  constructor(id, handlers = [DetailsHander]) {
    this.id = id;
    this.component = new RepositoryComponent(id);
    this.handlers = handlers.map((Handler) => new Handler(this.component));
  }

  get hasNextPage() {
    return this.handlers.reduce((acc, h) => acc || h.hasNextPage, false);
  }

  async run() {
    while (this.hasNextPage) {
      // prepare all handlers
      await Promise.map(this.handlers, (handler) => handler.updateComponent());

      // run queries and update handlers
      await Query.create()
        .compose(this.component)
        .then(({ data, users }) =>
          knex.transaction((trx) =>
            Promise.all([
              ActorsDAO.insert(users, trx),
              Promise.map(this.handlers, (handler) => handler.updateDatabase(data, trx))
            ])
          )
        );
    }
  }
};
