const { get } = require('lodash');

const Handler = require('./Handler');

module.exports = class RepositoryReleasesHander extends Handler {
  constructor(component) {
    super();
    this.component = component;
    this.releases = { items: [], hasNextPage: true, endCursor: null };
  }

  async updateComponent() {
    if (!this.releases.endCursor) {
      const { value } =
        (await this.dao.metadata
          .find({ id: this.component.id, resource: 'releases', key: 'endCursor' })
          .select('value')
          .first()) || {};

      this.releases.endCursor = value;
    }

    this.component.includeReleases(this.releases.hasNextPage, {
      after: this.releases.endCursor || null,
      name: '_releases'
    });
  }

  async updateDatabase(data, trx = null) {
    if (data) {
      this.releases.items.push(
        ...get(data, 'repository._releases.nodes', []).map((r) => ({
          ...r,
          repository: this.component.id
        }))
      );

      const langPageInfo = 'repository._releases.page_info';
      this.releases.hasNextPage = get(data, `${langPageInfo}.has_next_page`);
      this.releases.endCursor = get(data, `${langPageInfo}.end_cursor`, this.releases.endCursor);

      if (this.done) {
        const meta = { id: this.component.id, resource: 'releases' };
        await Promise.all([
          this.dao.releases.insert(this.data, trx),
          this.dao.metadata.upsert(
            [
              { ...meta, key: 'updatedAt', value: new Date().toISOString() },
              { ...meta, key: 'endCursor', value: this.releases.endCursor }
            ],
            trx
          )
        ]);
      }
    }
  }

  get hasNextPage() {
    return this.releases.hasNextPage;
  }

  get data() {
    return this.compact(this.releases.items) || [];
  }
};
