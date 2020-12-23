const { get } = require('lodash');

const Handler = require('./Handler');

module.exports = class RepositoryStargazersHander extends Handler {
  constructor(component) {
    super();
    this.component = component;
    this.stargazers = { hasNextPage: true, endCursor: null };
    this.meta = { id: this.component.id, resource: 'stargazers' };
  }

  async updateComponent() {
    if (this.stargazers.endCursor === null) {
      const { value } =
        (await this.dao.metadata
          .find({ ...this.meta, key: 'endCursor' })
          .select('value')
          .first()) || {};

      this.stargazers.endCursor = value;
    }

    this.component.includeStargazers(this.stargazers.hasNextPage, {
      after: this.stargazers.endCursor || null
    });
  }

  async updateDatabase(data, trx = null) {
    if (this.done) return;

    if (data) {
      const stargazers = get(data, 'repository.stargazers.edges', []).map((star) => ({
        repository: this.component.id,
        ...star
      }));

      const pageInfo = 'repository.stargazers.page_info';
      this.stargazers.hasNextPage = get(data, `${pageInfo}.has_next_page`);
      this.stargazers.endCursor = get(data, `${pageInfo}.end_cursor`, this.stargazers.endCursor);

      await Promise.all([
        this.dao.stargazers.insert(stargazers, trx),
        this.dao.metadata.upsert(
          [
            { ...this.meta, key: 'updatedAt', value: new Date().toISOString() },
            { ...this.meta, key: 'endCursor', value: this.stargazers.endCursor }
          ],
          trx
        )
      ]);
    }
  }

  get hasNextPage() {
    return this.stargazers.hasNextPage;
  }
};
