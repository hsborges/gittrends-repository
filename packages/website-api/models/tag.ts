/*
 *  Author: Hudson S. Borges
 */
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { Repository } from './';
import AbstractClass from './base';

@Entity({ tableName: 'tags' })
export default class Tag extends AbstractClass {
  @PrimaryKey()
  id!: string;

  @ManyToOne()
  @Index()
  repository!: Repository;

  @Property()
  name!: string;

  @Property()
  committed_date?: Date;

  @Property()
  additions?: number;

  @Property()
  deletions?: number;

  @Property()
  changed_files?: number;
}
