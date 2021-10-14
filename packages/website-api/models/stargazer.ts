/*
 *  Author: Hudson S. Borges
 */
import { Entity, Index, ManyToOne, PrimaryKey } from '@mikro-orm/core';

import { Actor, Repository } from './';
import AbstractClass from './base';

@Entity({ tableName: 'stargazers' })
export default class Stargazer extends AbstractClass {
  @ManyToOne({ primary: true })
  @Index()
  repository!: Repository;

  @ManyToOne({ primary: true })
  user!: Actor;

  @PrimaryKey()
  starred_at!: Date;

  @PrimaryKey()
  type!: string;
}
