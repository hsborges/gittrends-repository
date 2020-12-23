const { get } = require('lodash');

const Handler = require('./Handler');

module.exports = class RepositoryReleasesHander extends Handler {
  constructor(component) {
    super();
    this.component = component;
    this.releases = { hasNextPage: true, endCursor: null };
    this.meta = { id: this.component.id, resource: 'releases' };
  }

  async updateComponent() {
    if (this.releases.endCursor === null) {
      const { value } =
        (await this.dao.metadata
          .find({ ...this.meta, key: 'endCursor' })
          .select('value')
          .first()) || {};

      this.releases.endCursor = value;
    }

    this.component.includeReleases(this.releases.hasNextPage, {
      after: this.releases.endCursor || null
    });
  }

  async updateDatabase(data, trx = null) {
    if (this.done) return;

    if (data) {
      const releases = get(data, 'repository.releases.nodes', []).map((r) => ({
        ...r,
        repository: this.component.id
      }));

      const langPageInfo = 'repository.releases.page_info';
      this.releases.hasNextPage = get(data, `${langPageInfo}.has_next_page`);
      this.releases.endCursor = get(data, `${langPageInfo}.end_cursor`, this.releases.endCursor);

      await Promise.all([
        this.dao.releases.insert(releases, trx),
        this.dao.metadata.upsert(
          [
            { ...this.meta, key: 'updatedAt', value: new Date().toISOString() },
            { ...this.meta, key: 'endCursor', value: this.releases.endCursor }
          ],
          trx
        )
      ]);
    }
  }

  get hasNextPage() {
    return this.releases.hasNextPage;
  }
};
