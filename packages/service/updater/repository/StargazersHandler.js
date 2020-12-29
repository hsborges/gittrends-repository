/*
 *  Author: Hudson S. Borges
 */
const { get } = require('lodash');

const AbstractRepositoryHandler = require('./AbstractRepositoryHandler');

module.exports = class RepositoryStargazersHander extends AbstractRepositoryHandler {
  constructor(id, alias) {
    super(id, alias);
    this.stargazers = { hasNextPage: true, endCursor: null };
    this.meta = { id: this.component.id, resource: 'stargazers' };
  }

  async updateComponent() {
    if (this.stargazers.endCursor === null) {
      this.stargazers.endCursor = await this.dao.metadata
        .find({ ...this.meta, key: 'endCursor' })
        .select('value')
        .first()
        .then(({ value } = {}) => value);
    }

    this.component.includeStargazers(this.stargazers.hasNextPage, {
      first: this.batchSize,
      after: this.stargazers.endCursor || null
    });
  }

  async updateDatabase(response, trx = null) {
    if (this.done) return;

    if (response) {
      const data = response[this.alias];

      const stargazers = get(data, 'stargazers.edges', []).map((star) => ({
        repository: this.component.id,
        ...star
      }));

      const pageInfo = 'stargazers.page_info';
      this.stargazers.hasNextPage = get(data, `${pageInfo}.has_next_page`);
      this.stargazers.endCursor = get(data, `${pageInfo}.end_cursor`, this.stargazers.endCursor);

      await Promise.all([
        this.dao.stargazers.insert(stargazers, trx),
        this.dao.metadata.upsert(
          [{ ...this.meta, key: 'endCursor', value: this.stargazers.endCursor }],
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

  error(err) {
    throw err;
  }

  get hasNextPage() {
    return this.stargazers.hasNextPage;
  }
};
