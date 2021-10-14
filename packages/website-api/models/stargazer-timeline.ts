/*
 *  Author: Hudson S. Borges
 */
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { Repository } from './';
import AbstractClass from './base';

@Entity({ tableName: 'stargazers_timeseries' })
export default class StargazerTimeseries extends AbstractClass {
  @ManyToOne({ primary: true })
  @Index()
  repository!: Repository;

  @PrimaryKey()
  date!: Date;

  @Property()
  stargazers_count!: number;
}
