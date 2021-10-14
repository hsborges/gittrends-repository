/*
 *  Author: Hudson S. Borges
 */
import {
  Cascade,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property
} from '@mikro-orm/core';

import { Actor, StargazerTimeseries, Tag } from './';
import AbstractClass from './base';

@Entity({ tableName: 'repositories' })
export default class Repository extends AbstractClass {
  @PrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @ManyToOne()
  owner?: Actor;

  @Property()
  name_with_owner!: string;

  @Property()
  homepage_url?: string;

  @Property()
  stargazers_count?: number;

  @Property()
  watchers_count?: number;

  @Property()
  forks_count?: number;

  @Property()
  primary_language?: string;

  @Property()
  default_branch?: string;

  @Property()
  code_of_conduct?: string;

  @Property()
  license_info?: string;

  @Property()
  issues_count?: number;

  @Property()
  pull_requests_count_count?: number;

  @Property()
  releases_count?: number;

  @Property()
  vulnerability_alerts_count?: number;

  @Property()
  created_at?: Date;

  @Property()
  updated_at?: Date;

  @Property()
  disk_usage?: number;

  @Property()
  open_graph_image_url?: string;

  @Property()
  description?: string;

  @OneToMany({
    entity: () => Tag,
    mappedBy: 'repository',
    cascade: [Cascade.ALL]
  })
  tags = new Collection<Tag>(this);

  @OneToMany({
    entity: () => StargazerTimeseries,
    mappedBy: 'repository',
    cascade: [Cascade.ALL]
  })
  timeseries = new Collection<StargazerTimeseries>(this);

  @OneToMany({
    entity: () => RepositoryMetadata,
    mappedBy: 'repository',
    cascade: [Cascade.ALL]
  })
  metadata = new Collection<RepositoryMetadata>(this);
}

@Entity({ tableName: 'repositories_metadata' })
export class RepositoryMetadata extends AbstractClass {
  @ManyToOne({ primary: true })
  repository!: Repository;

  @PrimaryKey()
  resource!: string;

  @Property()
  updated_at?: Date;
}
