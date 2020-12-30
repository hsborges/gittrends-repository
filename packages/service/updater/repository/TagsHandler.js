/*
 *  Author: Hudson S. Borges
 */
const { get, omit } = require('lodash');
const { RetryableError } = require('../../helpers/errors');

const AbstractRepositoryHandler = require('./AbstractRepositoryHandler');

const debug = require('debug')('updater:tags-handler');

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
      first: this.batchSize,
      after: this.tags.endCursor || null
    });
  }

  async updateDatabase(response, trx = null) {
    if (this.done) return;

    if (response) {
      const data = response[this.alias];

      const tags = get(data, 'tags.nodes', []).map((tag) => ({
        repository: this.component.id,
        ...(tag.target.type === 'Tag' ? omit(tag.target, 'type') : tag)
      }));

      const pageInfo = 'tags.page_info';
      this.tags.hasNextPage = get(data, `${pageInfo}.has_next_page`);
      this.tags.endCursor = get(data, `${pageInfo}.end_cursor`, this.tags.endCursor);

      await Promise.all([
        this.dao.tags.insert(tags, trx),
        this.dao.metadata.upsert(
          [{ ...this.meta, key: 'endCursor', value: this.tags.endCursor }],
          trx
        )
      ]);

      return (this.batchSize = Math.min(this.defaultBatchSize, this.batchSize * 2));
    }

    if (this.done) {
      return this.dao.metadata.upsert(
        [{ ...this.meta, key: 'updatedAt', value: new Date().toISOString() }],
        trx
      );
    }
  }

  error(err) {
    if (err instanceof RetryableError) {
      debug(`An error was detected (${err.constructor.name}). Reducing batch size ...`);
      if (this.batchSize > 1) return (this.batchSize = Math.floor(this.batchSize / 2));
    }

    super.error(err);
  }

  get hasNextPage() {
    return this.tags.hasNextPage;
  }
};
