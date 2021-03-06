/*
 *  Author: Hudson S. Borges
 */
import { filter } from 'bluebird';
import { ClientSession } from 'mongodb';
import { Actor, Commit, Milestone } from '@gittrends/database-config';

import Cache from '../Cache';
import Handler from '../Handler';
import parser from '../../helpers/response-parser';
import RepositoryComponent from '../../github/components/RepositoryComponent';

export default abstract class AbstractRepositoryHandler extends Handler<RepositoryComponent> {
  readonly id: string;
  readonly meta: { id: string; resource: string };

  protected actors: TObject[] = [];
  protected commits: TObject[] = [];
  protected milestones: TObject[] = [];

  cache?: Cache;
  writeBatchSize: number;
  batchSize: number;
  defaultBatchSize: number;

  protected constructor(id: string, alias = 'repository', resource: string) {
    super(new RepositoryComponent(id).setAlias(alias));
    this.id = id;
    this.meta = { id, resource };
    this.batchSize = this.defaultBatchSize = 100;
    this.writeBatchSize = parseInt(process.env.GITTRENDS_WRITE_BATCH_SIZE ?? '500', 10);
  }

  protected parseResponse(response: any): any {
    const { data, actors, commits, milestones } = parser(response);
    this.actors.push(...actors);
    this.commits.push(...commits);
    this.milestones.push(...milestones);
    return data;
  }

  protected async saveReferences(session?: ClientSession): Promise<void> {
    const objectIsNotInCache = (object: any) => !this.cache?.has(object);

    const [actors, commits, milestones] = await Promise.all([
      filter(this.actors, objectIsNotInCache),
      filter(this.commits, objectIsNotInCache),
      filter(this.milestones, objectIsNotInCache)
    ]);

    await Promise.all([
      Actor.insert(actors, session).then(() => this.cache?.add(actors)),
      Commit.upsert(commits, session).then(() => this.cache?.add(commits)),
      Milestone.upsert(milestones, session).then(() => this.cache?.add(milestones))
    ]);

    this.actors = [];
    this.commits = [];
    this.milestones = [];
  }

  abstract error(err: Error): Promise<void>;
}
