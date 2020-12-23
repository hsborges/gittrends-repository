const { get, omit } = require('lodash');

const Handler = require('./Handler');

module.exports = class RepositoryTagsHander extends Handler {
  constructor(component) {
    super();
    this.component = component;
    this.tags = { hasNextPage: true, endCursor: null };
    this.meta = { id: this.component.id, resource: 'tags' };
  }

  async updateComponent() {
    if (this.tags.endCursor === null) {
      const { value } =
        (await this.dao.metadata
          .find({ ...this.meta, key: 'endCursor' })
          .select('value')
          .first()) || {};

      this.tags.endCursor = value;
    }

    this.component.includeTags(this.tags.hasNextPage, { after: this.tags.endCursor || null });
  }

  async updateDatabase(data, trx = null) {
    if (this.done) return;

    if (data) {
      const tags = get(data, 'repository.tags.nodes', []).map((t) => ({
        ...(t.target.type === 'Tag' ? omit(t.target, 'type') : t),
        repository: this.component.id
      }));

      const langPageInfo = 'repository.tags.page_info';
      this.tags.hasNextPage = get(data, `${langPageInfo}.has_next_page`);
      this.tags.endCursor = get(data, `${langPageInfo}.end_cursor`, this.tags.endCursor);

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
