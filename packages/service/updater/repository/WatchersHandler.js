/*
 *  Author: Hudson S. Borges
 */
const { get } = require('lodash');

const AbstractRepositoryHandler = require('./AbstractRepositoryHandler');

module.exports = class RepositoryWatchersHander extends AbstractRepositoryHandler {
  constructor(id, alias) {
    super(id, alias);
    this.watchers = { hasNextPage: true, endCursor: null };
    this.meta = { id: this.component.id, resource: 'watchers' };
  }

  async updateComponent() {
    if (this.watchers.endCursor === null) {
      this.watchers.endCursor = await this.dao.metadata
        .find({ ...this.meta, key: 'endCursor' })
        .select('value')
        .first()
        .then(({ value } = {}) => value);
    }

    this.component.includeWatchers(this.watchers.hasNextPage, {
      first: this.batchSize,
      after: this.watchers.endCursor || null
    });
  }

  async updateDatabase(response, trx = null) {
    if (this.done) return;

    if (response) {
      const data = response[this.alias];

      const watchers = get(data, 'watchers.nodes', []).map((watcher) => ({
        repository: this.component.id,
        user: watcher
      }));

      const pageInfo = 'watchers.page_info';
      this.watchers.hasNextPage = get(data, `${pageInfo}.has_next_page`);
      this.watchers.endCursor = get(data, `${pageInfo}.end_cursor`, this.watchers.endCursor);

      await Promise.all([
        this.dao.watchers.insert(watchers, trx),
        this.dao.metadata.upsert(
          [{ ...this.meta, key: 'endCursor', value: this.watchers.endCursor }],
          trx
        )
      ]);
    }

    if (this.done) {
      return this.dao.metadata.upsert(
        [{ ...this.meta, key: 'updatedAt', value: new Date().toISOString() }],
        trx
      );
    }
  }

  get hasNextPage() {
    return this.watchers.hasNextPage;
  }
};
