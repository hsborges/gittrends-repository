import { get } from 'lodash';
import { Transaction } from 'knex';
import knex, { Metadata, IMetadata, Stargazer, Actor } from '@gittrends/database-config';

import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import { InternalError, ResourceUpdateError, RetryableError } from '../../helpers/errors';

export default class RepositoryDetailsHander extends AbstractRepositoryHandler {
  stargazers: { hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'stargazers');
    this.stargazers = { hasNextPage: true };
  }

  async updateComponent(): Promise<void> {
    if (!this.stargazers.endCursor) {
      this.stargazers.endCursor = await Metadata.query()
        .where({ ...this.meta, key: 'endCursor' })
        .first<IMetadata>()
        .then((result) => result && result.value);
    }

    this.component.includeStargazers(this.stargazers.hasNextPage, {
      first: this.batchSize,
      after: this.stargazers.endCursor,
      alias: 'stargazers'
    });
  }

  async updateDatabase(response: TObject, trx: Transaction): Promise<void> {
    if (this.done) return;

    const data = response[this.alias];

    const stargazers = get(data, 'stargazers.edges', []).map(
      (stargazer: { user: string; starred_at: Date }) => ({
        repository: this.component.id,
        ...stargazer
      })
    );

    const pageInfo = get(data, 'stargazers.page_info', {});
    this.stargazers.hasNextPage = pageInfo.has_next_page || false;
    this.stargazers.endCursor = pageInfo.end_cursor || this.stargazers.endCursor;

    await Promise.all([
      Stargazer.insert(stargazers, trx),
      Metadata.upsert({ ...this.meta, key: 'endCursor', value: this.stargazers.endCursor })
    ]);

    if (this.done) {
      await Metadata.upsert({ ...this.meta, key: 'updatedAt', value: new Date() });
    }
  }

  async error(err: Error): Promise<void> {
    if (err instanceof InternalError) {
      const stargazers = get(err, `response.data.${this.alias}.stargazers.edges`, [])
        .map((star: TObject) => ({ repository: this.component.id, ...star }))
        .filter((star: TObject) => star.starred_at);

      if (stargazers.length) {
        const pageInfo = get(err, `response.data.${this.alias}.stargazers.page_info`);
        this.stargazers.hasNextPage = pageInfo.has_next_page;
        this.stargazers.endCursor = pageInfo.end_cursor || this.stargazers.endCursor;

        await knex.transaction((trx) =>
          Promise.all([
            Actor.insert(get(err, 'response.actors', []), trx),
            Stargazer.insert(stargazers, trx),
            Metadata.upsert(
              [{ ...this.meta, key: 'endCursor', value: this.stargazers.endCursor }],
              trx
            )
          ])
        );

        return;
      }
    }

    if (err instanceof RetryableError) {
      if (this.batchSize > 1) {
        this.batchSize = Math.floor(this.batchSize / 2);
        return;
      }
    }

    throw new ResourceUpdateError(err.message, err);
  }

  get hasNextPage(): boolean {
    return this.stargazers.hasNextPage;
  }
}
