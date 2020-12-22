const { get, omit } = require('lodash');

const Handler = require('./Handler');

module.exports = class RepositoryTagsHander extends Handler {
  constructor(component) {
    super();
    this.component = component;
    this.tags = { items: [], hasNextPage: true, endCursor: null };
  }

  async updateComponent() {
    if (!this.tags.endCursor) {
      const { value } =
        (await this.dao.metadata
          .find({ id: this.component.id, resource: 'tags', key: 'endCursor' })
          .select('value')
          .first()) || {};

      this.tags.endCursor = value;
    }

    this.component.includeTags(this.tags.hasNextPage, { after: this.tags.endCursor || null });
  }

  async updateDatabase(data, trx = null) {
    if (data) {
      this.tags.items.push(
        ...get(data, 'repository.tags.nodes', []).map((t) => ({
          ...(t.target.type === 'Tag' ? omit(t.target, 'type') : t),
          repository: this.component.id
        }))
      );

      const langPageInfo = 'repository.tags.page_info';
      this.tags.hasNextPage = get(data, `${langPageInfo}.has_next_page`);
      this.tags.endCursor = get(data, `${langPageInfo}.end_cursor`, this.tags.endCursor);

      if (this.done) {
        const meta = { id: this.component.id, resource: 'tags' };
        await Promise.all([
          this.dao.tags.insert(this.data, trx),
          this.dao.metadata.upsert(
            [
              { ...meta, key: 'updatedAt', value: new Date().toISOString() },
              { ...meta, key: 'endCursor', value: this.tags.endCursor }
            ],
            trx
          )
        ]);
      }
    }
  }

  get hasNextPage() {
    return this.tags.hasNextPage;
  }

  get data() {
    return this.compact(this.tags.items) || [];
  }
};
