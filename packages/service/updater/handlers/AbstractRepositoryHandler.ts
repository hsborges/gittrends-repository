/*
 *  Author: Hudson S. Borges
 */
import { filter } from 'bluebird';

import { Actor, Commit, Entity, Milestone, MongoRepository } from '@gittrends/database-config';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import { ResourceUpdateError } from '../../helpers/errors';
import parser from '../../helpers/response-parser';
import { Cache } from '../Cache';
import Handler from '../Handler';

export default abstract class AbstractRepositoryHandler extends Handler<RepositoryComponent> {
  static readonly resource: string;

  readonly id: string;

  protected actors: Actor[] = [];
  protected commits: Commit[] = [];
  protected milestones: Milestone[] = [];

  cache?: Cache;
  batchSize: number;
  defaultBatchSize: number;

  protected constructor(id: string, alias = 'repository') {
    super(new RepositoryComponent(id).setAlias(alias));
    this.id = id;
    this.batchSize = this.defaultBatchSize = 100;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  protected parseResponse(response: any): any {
    const { data, actors, commits, milestones } = parser(response);
    this.actors.push(...actors.map((actor) => new Actor(actor)));
    this.commits.push(...commits.map((commit) => new Commit(commit)));
    this.milestones.push(...milestones.map((milestone) => new Milestone(milestone)));
    return data;
  }

  protected async saveReferences(): Promise<void> {
    const _filter = async <T extends Entity>(entities: T[]) =>
      await filter(entities, async (object) => !(await this.cache?.has(object)));

    const [actors, commits, milestones] = await Promise.all([
      _filter(this.actors),
      _filter(this.commits),
      _filter(this.milestones)
    ]);

    await Promise.all([
      MongoRepository.get(Actor)
        .insert(actors)
        .then(() => this.cache?.add(actors)),
      MongoRepository.get(Commit)
        .upsert(commits)
        .then(() => this.cache?.add(commits)),
      MongoRepository.get(Milestone)
        .upsert(milestones)
        .then(() => this.cache?.add(milestones))
    ]);

    this.actors = [];
    this.commits = [];
    this.milestones = [];
  }

  async error(err: Error): Promise<void> {
    throw new ResourceUpdateError(err);
  }
}
