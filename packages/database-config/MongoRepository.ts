/*
 *  Author: Hudson S. Borges
 */
import { ClassConstructor } from 'class-transformer';
import 'es6-shim';
import { Collection, Db, Document } from 'mongodb';
import 'reflect-metadata';

import { Entity } from './entities';
import * as Entities from './entities';

export class MongoRepository<T extends Entity> {
  public static db: Db;

  private entityRef!: ClassConstructor<T>;

  public get collection(): Collection<Document> {
    return MongoRepository.db?.collection((this.entityRef as any).__collection);
  }

  private constructor(entityRef: ClassConstructor<T>) {
    this.entityRef = entityRef;
  }

  private validateAndTransform(object: T | T[]): Record<string, unknown>[] {
    return (Array.isArray(object) ? object : [object])
      .map((record) => new this.entityRef(record.toJSON()))
      .map((record) => record.toJSON());
  }

  public async insert(object: T | T[]): Promise<void> {
    const records = this.validateAndTransform(object);

    if (!records.length) return;

    await this.collection
      .bulkWrite(
        records.map((record) => ({ insertOne: { document: record } })),
        { ordered: false }
      )
      .catch((err) => {
        if (err.code && err.code === 11000) return;
        else throw err;
      });
  }

  public async upsert(object: T | T[]): Promise<void> {
    const records = this.validateAndTransform(object);

    if (!records.length) return;

    await this.collection.bulkWrite(
      records.map((record) => ({
        replaceOne: { filter: { _id: record._id }, replacement: record, upsert: true }
      })),
      { ordered: false }
    );
  }

  public static create<T extends Entity>(entityRef: ClassConstructor<T>): MongoRepository<T> {
    return new MongoRepository(entityRef);
  }
}

export const ActorRepository = MongoRepository.create(Entities.Actor);
export const CommitRepository = MongoRepository.create(Entities.Commit);
export const DependencyRepository = MongoRepository.create(Entities.Dependency);
export const GithubTokenRepository = MongoRepository.create(Entities.GithubToken);
export const IssueRepository = MongoRepository.create(Entities.Issue);
export const LocationRepository = MongoRepository.create(Entities.Location);
export const MilestoneRepository = MongoRepository.create(Entities.Milestone);
export const PullRequestRepository = MongoRepository.create(Entities.PullRequest);
export const ReactionRepository = MongoRepository.create(Entities.Reaction);
export const ReleaseRepository = MongoRepository.create(Entities.Release);
export const RepositoryRepository = MongoRepository.create(Entities.Repository);
export const StargazerRepository = MongoRepository.create(Entities.Stargazer);
export const TagRepository = MongoRepository.create(Entities.Tag);
export const TimelineEventRepository = MongoRepository.create(Entities.TimelineEvent);
export const WatcherRepository = MongoRepository.create(Entities.Watcher);
