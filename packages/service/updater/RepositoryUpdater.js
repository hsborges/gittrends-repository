/*
 *  Author: Hudson S. Borges
 */
const { snakeCase, pick } = require('lodash');
const { knex } = require('@gittrends/database-config');
const { actors: ActorsDAO, commits: CommitsDAO } = require('./dao');

const Updater = require('./Updater');
const Query = require('../github/graphql/Query');

module.exports = class RepositoryUpdater extends Updater {
  constructor(id, handlers = [], job = null) {
    if (!id || !handlers || !handlers.length)
      throw new Error('Repository ID and handlers are mandatory!');

    super();
    this.id = id;
    this.job = job;
    this.handlers = handlers.map((Handler) => new Handler(id, snakeCase(Handler.name)));
  }

  async $update(handlers) {
    // prepare all handlers
    await Promise.map(handlers, (handler) => handler.updateComponent());

    // run queries and update handlers
    return await Query.create()
      .compose(...handlers.map((handler) => handler.component))
      .then(async ({ data, actors = [], commits = [] }) => {
        await knex.transaction((trx) =>
          Promise.all([
            ActorsDAO.insert(actors, trx),
            CommitsDAO.insert(commits, trx),
            Promise.map(handlers, (handler) =>
              handler.updateDatabase(pick(data, handler.alias), trx)
            )
          ])
        );

        handlers.forEach((handler) => {
          if (handler.done && this.job) {
            this.job.progress(
              Math.ceil((1 - this.pendingHandlers.length / this.handlers.length) * 100)
            );
            this.job.update({
              ...this.job.data,
              resources: this.job.data.resources.filter((r) => r !== handler.meta.resource),
              done: [...(this.job.data.done || []), handler.meta.resource]
            });
          }
        });
      })
      .catch(async (err) => {
        if (handlers.length === 1) return handlers[0].error(err);
        else return Promise.map(handlers, (handler) => this.$update([handler]));
      });
  }

  async update() {
    while (this.hasNextPage) {
      await this.$update(this.pendingHandlers);
    }
  }

  get hasNextPage() {
    return this.pendingHandlers.length > 0;
  }

  get pendingHandlers() {
    return this.handlers.filter((handler) => handler.hasNextPage);
  }
};
