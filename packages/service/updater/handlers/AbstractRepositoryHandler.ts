/*
 *  Author: Hudson S. Borges
 */
import { Actor, Commit, Milestone, MongoRepository } from '@gittrends/database';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import { ResourceUpdateError } from '../../helpers/errors';
import responseParser from '../../helpers/response-parser';
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

  protected parseResponse(response: any): any {
    const { data, actors, commits, milestones } = responseParser(response);
    this.actors.push(...actors.map((actor) => new Actor(actor)));
    this.commits.push(...commits.map((commit) => new Commit(commit)));
    this.milestones.push(...milestones.map((milestone) => new Milestone(milestone)));
    return data;
  }

  protected async saveReferences(): Promise<void> {
    await Promise.resolve(this.actors.filter((v) => !this.cache?.has(v))).then((actors) =>
      MongoRepository.get(Actor)
        .insert(actors)
        .then(() => this.cache?.add(actors))
        .then(() => (this.actors = []))
    );

    await Promise.resolve(this.commits.filter((v) => !this.cache?.has(v))).then((commits) =>
      MongoRepository.get(Commit)
        .upsert(commits)
        .then(() => this.cache?.add(commits))
        .then(() => (this.commits = []))
    );

    await Promise.resolve(this.milestones.filter((v) => !this.cache?.has(v))).then((milestones) =>
      MongoRepository.get(Milestone)
        .upsert(milestones)
        .then(() => this.cache?.add(milestones))
        .then(() => (this.milestones = []))
    );
  }

  async error(err: Error): Promise<void> {
    throw new ResourceUpdateError(err);
  }
}
