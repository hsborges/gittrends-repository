/*
 *  Author: Hudson S. Borges
 */
import { IsDefined, IsString } from 'class-validator';

import { Entity } from './Entity';

export class TimelineEvent extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'timeline';
  static readonly __whitelist = false;

  // Entity fields
  @IsDefined()
  @IsString()
  _id!: string;

  @IsDefined()
  @IsString()
  repository!: string;

  @IsDefined()
  @IsString()
  issue!: string;

  @IsDefined()
  @IsString()
  type!: string;
}
