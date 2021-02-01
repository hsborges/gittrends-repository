/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';
import { Transaction } from 'knex';
import knex, { Metadata, Stargazer, Actor } from '@gittrends/database-config';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';
import { InternalError, RetryableError } from '../../helpers/errors';

export default class StargazersHandler extends AbstractRepositoryHandler {
  stargazers: { items: TObject[]; hasNextPage: boolean; endCursor?: string };

  constructor(id: string, alias?: string) {
    super(id, alias, 'stargazers');
    this.stargazers = { items: [], hasNextPage: true };
  }

  async component(): Promise<RepositoryComponent> {
    if (!this.stargazers.endCursor) {
      this.stargazers.endCursor = await Metadata.find(
        this.meta.id,
        this.meta.resource,
        'endCursor'
      ).then((result) => result && result.value);
    }

    return this._component.includeStargazers(this.stargazers.hasNextPage, {
      first: this.batchSize,
      after: this.stargazers.endCursor,
      alias: 'stargazers'
    });
  }

  async update(response: TObject, trx: Transaction): Promise<void> {
    if (this.isDone()) return;

    const data = response[this.alias as string];

    this.stargazers.items.push(
      ...get(data, 'stargazers.edges', []).map((stargazer: { user: string; starred_at: Date }) => ({
        repository: this.id,
        ...stargazer
      }))
    );

    const pageInfo = get(data, 'stargazers.page_info', {});
    this.stargazers.hasNextPage = pageInfo.has_next_page ?? false;
    this.stargazers.endCursor = pageInfo.end_cursor ?? this.stargazers.endCursor;

    if (this.stargazers.items.length >= this.writeBatchSize || this.isDone()) {
      await Promise.all([
        Stargazer.insert(this.stargazers.items, trx),
        Metadata.upsert({ ...this.meta, key: 'endCursor', value: this.stargazers.endCursor }, trx)
      ]);
      this.stargazers.items = [];
    }

    if (this.isDone()) {
      await Metadata.upsert({ ...this.meta, key: 'updatedAt', value: new Date().toISOString() });
    }
  }

  async error(err: Error): Promise<void> {
    if (err instanceof InternalError) {
      const stargazers = get(err, `response.data.${this.alias}.stargazers.edges`, [])
        .map((star: TObject) => ({ repository: this.id, ...star }))
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

    super.error(err);
  }

  hasNextPage(): boolean {
    return this.stargazers.hasNextPage;
  }
}
