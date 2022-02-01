/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import { Stargazer, MongoRepository, Repository } from '@gittrends/database';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import { GithubRequestError, RequestError } from '../../helpers/errors';
import AbstractRepositoryHandler from './AbstractRepositoryHandler';

export default class StargazersHandler extends AbstractRepositoryHandler {
  static resource: string = 'stargazers';

  private meta: { hasNextPage: boolean; endCursor?: string } = { hasNextPage: true };

  async component(): Promise<RepositoryComponent> {
    if (!this.meta.endCursor) {
      this.meta.endCursor = await MongoRepository.get(Repository)
        .collection.findOne({ _id: this.id }, { projection: { _metadata: 1 } })
        .then((res) => res && get(res, `_metadata.${StargazersHandler.resource}.endCursor`));
    }

    return this._component.includeStargazers(this.meta.hasNextPage, {
      first: this.batchSize,
      after: this.meta.endCursor,
      alias: '_stargazers'
    });
  }

  async update(response: Record<string, unknown>): Promise<void> {
    return this._update(response).finally(
      () => (this.batchSize = Math.min(this.defaultBatchSize, this.batchSize * 2))
    );
  }

  private async _update(response: Record<string, unknown>): Promise<void> {
    const data = super.parseResponse(response[this.alias as string]);

    const pageInfo = get(data, '_stargazers.page_info', {});
    this.meta.hasNextPage = pageInfo.has_next_page ?? false;
    this.meta.endCursor = pageInfo.end_cursor ?? this.meta.endCursor;

    this.entityStorage.add(
      get<{ user: string; starred_at: Date }[]>(data, '_stargazers.edges', [])
        .map((stargazer) => new Stargazer({ repository: this.id, ...stargazer }))
        .filter((star) => star && star._id.starred_at)
    );

    if (this.entityStorage.size() >= 500 || this.isDone()) {
      await this.entityStorage
        .persist()
        .then(() =>
          MongoRepository.get(Repository).collection.updateOne(
            { _id: this.id },
            { $set: { [`_metadata.${StargazersHandler.resource}.endCursor`]: this.meta.endCursor } }
          )
        );
    }

    if (this.isDone()) {
      await MongoRepository.get(Repository).collection.updateOne(
        { _id: this.id },
        { $set: { [`_metadata.${StargazersHandler.resource}.updatedAt`]: new Date() } }
      );
    }
  }

  async error(err: Error): Promise<void> {
    if (err instanceof GithubRequestError && err.all('INTERNAL')) {
      return this.update(get(err, 'response.data'));
    } else if (err instanceof RequestError) {
      if (this.batchSize > 1) {
        this.batchSize = 1;
        return;
      }
    }

    return super.error(err);
  }

  hasNextPage(): boolean {
    return this.meta.hasNextPage;
  }
}
