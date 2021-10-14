/*
 *  Author: Hudson S. Borges
 */
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

import AbstractClass from './base';

@Entity({ tableName: 'actors' })
export default class Actor extends AbstractClass {
  @PrimaryKey()
  id!: string;

  @Property()
  type?: string;

  @Property()
  login!: string;

  @Property()
  name?: string;

  @Property()
  avatar_url?: string;

  @Property()
  created_at?: Date;

  @Property()
  updated_at?: Date;
}
