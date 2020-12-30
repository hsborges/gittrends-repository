/*
 *  Author: Hudson S. Borges
 */
const { get } = require('lodash');
const { knex } = require('@gittrends/database-config');
const { RetryableError, InternalError } = require('../../helpers/errors');

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

      this.batchSize = Math.min(this.defaultBatchSize, this.batchSize * 2);
    }

    if (this.done) {
      return this.dao.metadata.upsert(
        [{ ...this.meta, key: 'updatedAt', value: new Date().toISOString() }],
        trx
      );
    }
  }

  async error(err) {
    if (err instanceof InternalError) {
      const stargazers = get(err, `response.data.${this.alias}.stargazers.edges`, [])
        .map((star) => ({ repository: this.component.id, ...star }))
        .filter((s) => s.starred_at);

      const actors = get(err, 'response.actors', []);

      if (stargazers.length && actors.length) {
        const pageInfo = get(err, `response.data.${this.alias}.stargazers.page_info`);
        this.stargazers.hasNextPage = pageInfo.has_next_page;
        this.stargazers.endCursor = pageInfo.end_cursor || this.stargazers.endCursor;

        return knex.transaction((trx) =>
          Promise.all([
            this.dao.actors.insert(actors, trx),
            this.dao.stargazers.insert(stargazers, trx),
            this.dao.metadata.upsert(
              [{ ...this.meta, key: 'endCursor', value: this.stargazers.endCursor }],
              trx
            )
          ])
        );
      }
    }

    if (err instanceof RetryableError) {
      if (this.batchSize > 1) return (this.batchSize = Math.floor(this.batchSize / 2));
    }

    super.error(err);
  }

  get hasNextPage() {
    return this.stargazers.hasNextPage;
  }
};
