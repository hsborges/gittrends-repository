/*
 *  Author: Hudson S. Borges
 */
const { get } = require('lodash');

const AbstractRepositoryHandler = require('./AbstractRepositoryHandler');

module.exports = class RepositoryReleasesHander extends AbstractRepositoryHandler {
  constructor(id, alias) {
    super(id, alias);
    this.releases = { hasNextPage: true, endCursor: null };
    this.meta = { id: this.component.id, resource: 'releases' };
  }

  async updateComponent() {
    if (this.releases.endCursor === null) {
      this.releases.endCursor = await this.dao.metadata
        .find({ ...this.meta, key: 'endCursor' })
        .select('value')
        .first()
        .then(({ value } = {}) => value);
    }

    this.component.includeReleases(this.releases.hasNextPage, {
      first: this.batchSize,
      after: this.releases.endCursor || null
    });
  }

  async updateDatabase(response, trx = null) {
    if (this.done) return;

    if (response) {
      const data = response[this.alias];

      const releases = get(data, 'releases.nodes', []).map((release) => ({
        repository: this.component.id,
        ...release
      }));

      const pageInfo = 'releases.page_info';
      this.releases.hasNextPage = get(data, `${pageInfo}.has_next_page`);
      this.releases.endCursor = get(data, `${pageInfo}.end_cursor`, this.releases.endCursor);

      await Promise.all([
        this.dao.releases.insert(releases, trx),
        this.dao.metadata.upsert(
          [{ ...this.meta, key: 'endCursor', value: this.releases.endCursor }],
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
    return this.releases.hasNextPage;
  }
};