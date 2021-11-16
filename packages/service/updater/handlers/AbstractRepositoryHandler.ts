/*
 *  Author: Hudson S. Borges
 */
import { filter } from 'bluebird';
import debug from 'debug';

import {
  Actor,
  ActorRepository,
  Commit,
  CommitRepository,
  Entity,
  Milestone,
  MilestoneRepository
} from '@gittrends/database-config';
import { ResourceUpdateError } from '@gittrends/service/helpers/errors';

import RepositoryComponent from '../../github/components/RepositoryComponent';
import parser from '../../helpers/response-parser';
import Cache from '../Cache';
import Handler from '../Handler';

export default abstract class AbstractRepositoryHandler extends Handler<RepositoryComponent> {
  readonly id: string;
  readonly meta: { id: string; resource: string };

  protected debug;
  protected actors: Actor[] = [];
  protected commits: Commit[] = [];
  protected milestones: Milestone[] = [];

  cache?: Cache;
  writeBatchSize: number;
  batchSize: number;
  defaultBatchSize: number;

  protected constructor(id: string, alias = 'repository', resource: string) {
    super(new RepositoryComponent(id).setAlias(alias));
    this.id = id;
    this.meta = { id, resource };
    this.batchSize = this.defaultBatchSize = 100;
    this.writeBatchSize = 1000;
    this.debug = debug(`gittrends:updater:handler:${resource}`);
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
      ActorRepository.insert(actors).then(() => this.cache?.add(actors)),
      CommitRepository.upsert(commits).then(() => this.cache?.add(commits)),
      MilestoneRepository.upsert(milestones).then(() => this.cache?.add(milestones))
    ]);

    this.actors = [];
    this.commits = [];
    this.milestones = [];
  }

  async error(err: Error): Promise<void> {
    throw new ResourceUpdateError(err);
  }
}
