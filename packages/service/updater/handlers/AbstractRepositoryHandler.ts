/*
 *  Author: Hudson S. Borges
 */
import { Actor, Commit, Entity, Milestone } from '@gittrends/database';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import responseParser from '../../helpers/response-parser';
import { Cache } from '../Cache';
import { EntityStorage } from '../EntityStorage';
import Handler from '../Handler';

export default abstract class AbstractRepositoryHandler extends Handler<RepositoryComponent> {
  static readonly resource: string;

  readonly id: string;
  protected batchSize: number;
  protected defaultBatchSize: number;
  protected entityStorage: EntityStorage<Entity>;

  public constructor(id: string, opts?: { alias?: string; cache?: Cache }) {
    super(new RepositoryComponent(id).setAlias(opts?.alias || 'repository'));
    this.id = id;
    this.batchSize = this.defaultBatchSize = 100;
    this.entityStorage = new EntityStorage(opts?.cache);
  }

  protected parseResponse(response: any): any {
    const { data, actors, commits, milestones } = responseParser(response);
    this.entityStorage.add(actors.map((actor) => new Actor(actor)));
    this.entityStorage.add(commits.map((commit) => new Commit(commit)));
    this.entityStorage.add(milestones.map((milestone) => new Milestone(milestone)));
    return data;
  }

  async error(err: Error): Promise<void> {
    throw err;
  }
}
