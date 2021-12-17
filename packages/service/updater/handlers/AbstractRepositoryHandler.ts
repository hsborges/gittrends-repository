/*
 *  Author: Hudson S. Borges
 */
import { Actor, Commit, Milestone, MongoRepository } from '@gittrends/database';

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

  protected batchSize: number;
  protected defaultBatchSize: number;

  public constructor(id: string, opts?: { alias?: string; cache?: Cache }) {
    super(new RepositoryComponent(id).setAlias(opts?.alias || 'repository'), {
      cache: opts?.cache
    });

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
    const [actors, commits, milestones] = [
      this.actors.filter((object) => !this.cache?.has(object)),
      this.commits.filter((object) => !this.cache?.has(object)),
      this.milestones.filter((object) => !this.cache?.has(object))
    ];

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
