const { get } = require('lodash');

const Handler = require('./Handler');

module.exports = class RepositoryWatchersHander extends Handler {
  constructor(component) {
    super();
    this.component = component;
    this.watchers = { hasNextPage: true, endCursor: null };
    this.meta = { id: this.component.id, resource: 'watchers' };
  }

  async updateComponent() {
    if (this.watchers.endCursor === null) {
      const { value } =
        (await this.dao.metadata
          .find({ ...this.meta, key: 'endCursor' })
          .select('value')
          .first()) || {};

      this.watchers.endCursor = value;
    }

    this.component.includeWatchers(this.watchers.hasNextPage, {
      after: this.watchers.endCursor || null
    });
  }

  async updateDatabase(data, trx = null) {
    if (this.done) return;

    if (data) {
      const watchers = get(data, 'repository.watchers.nodes', []).map((w) => ({
        repository: this.component.id,
        user: w
      }));

      const pageInfo = 'repository.watchers.page_info';
      this.watchers.hasNextPage = get(data, `${pageInfo}.has_next_page`);
      this.watchers.endCursor = get(data, `${pageInfo}.end_cursor`, this.watchers.endCursor);

      await Promise.all([
        this.dao.watchers.insert(watchers, trx),
        this.dao.metadata.upsert(
          [
            { ...this.meta, key: 'updatedAt', value: new Date().toISOString() },
            { ...this.meta, key: 'endCursor', value: this.watchers.endCursor }
          ],
          trx
        )
      ]);
    }
  }

  get hasNextPage() {
    return this.watchers.hasNextPage;
  }
};
