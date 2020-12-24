const { get, omit } = require('lodash');

const AbstractRepositoryHandler = require('./AbstractRepositoryHandler');

module.exports = class RepositoryTagsHander extends AbstractRepositoryHandler {
  constructor(id, alias) {
    super(id, alias);
    this.tags = { hasNextPage: true, endCursor: null };
    this.meta = { id: this.component.id, resource: 'tags' };
  }

  async updateComponent() {
    if (this.tags.endCursor === null) {
      this.tags.endCursor = await this.dao.metadata
        .find({ ...this.meta, key: 'endCursor' })
        .select('value')
        .first()
        .then(({ value } = {}) => value);
    }

    this.component.includeTags(this.tags.hasNextPage, {
      after: this.tags.endCursor || null
    });
  }

  async updateDatabase(response, trx = null) {
    if (this.done) return;

    if (response) {
      const data = response[this.alias];

      const tags = get(data, 'tags.nodes', []).map((t) => ({
        ...(t.target.type === 'Tag' ? omit(t.target, 'type') : t),
        repository: this.component.id
      }));

      const pageInfo = 'tags.page_info';
      this.tags.hasNextPage = get(data, `${pageInfo}.has_next_page`);
      this.tags.endCursor = get(data, `${pageInfo}.end_cursor`, this.tags.endCursor);

      await Promise.all([
        this.dao.tags.insert(tags, trx),
        this.dao.metadata.upsert(
          [
            { ...this.meta, key: 'updatedAt', value: new Date().toISOString() },
            { ...this.meta, key: 'endCursor', value: this.tags.endCursor }
          ],
          trx
        )
      ]);
    }
  }

  get hasNextPage() {
    return this.tags.hasNextPage;
  }
};
