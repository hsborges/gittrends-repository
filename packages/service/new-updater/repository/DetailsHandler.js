const { Repository } = require('@gittrends/database-config');
const { get, pick } = require('lodash');

const Handler = require('./Handler');

module.exports = class RepositoryDetailsHander extends Handler {
  constructor(component) {
    super();
    this.component = component;
    this.details = null;
    this.languages = { items: [], hasNextPage: true, endCursor: null };
    this.topics = { items: [], hasNextPage: true, endCursor: null };
    this.meta = { id: this.component.id, resource: 'repository' };
  }

  async updateComponent() {
    this.component
      .includeDetails(this.details === null)
      .includeLanguages(this.languages.hasNextPage, { after: this.languages.endCursor })
      .includeTopics(this.topics.hasNextPage, { after: this.topics.endCursor });
  }

  async updateDatabase(data, trx) {
    if (this.done) return;

    if (data) {
      if (this.details === null)
        this.details = pick(data.repository, Object.keys(Repository.jsonSchema.properties));

      this.languages.items.push(...get(data, 'repository.languages.edges', []));

      this.topics.items.push(
        ...get(data, 'repository.repository_topics.nodes', []).map((t) => t.topic)
      );

      const langPageInfo = 'repository.languages.page_info';
      this.languages.hasNextPage = get(data, `${langPageInfo}.has_next_page`);
      this.languages.endCursor = get(data, `${langPageInfo}.end_cursor`, this.languages.endCursor);

      const topicsPageInfo = 'repository.repository_topics.page_info';
      this.topics.hasNextPage = get(data, `${topicsPageInfo}.has_next_page`);
      this.topics.endCursor = get(data, `${topicsPageInfo}.end_cursor`, this.topics.endCursor);

      if (this.done)
        await Promise.all([
          this.dao.repositories.update(this.data, trx),
          this.dao.metadata.upsert(
            { ...this.meta, key: 'updatedAt', value: new Date().toISOString() },
            trx
          )
        ]);
    }
  }

  get hasNextPage() {
    return !this.details || this.languages.hasNextPage || this.topics.hasNextPage;
  }

  get data() {
    return this.compact({
      ...this.details,
      languages: this.languages.items,
      repository_topics: this.topics.items
    });
  }
};
