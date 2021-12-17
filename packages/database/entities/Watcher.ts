/*
 *  Author: Hudson S. Borges
 */
import { Type } from 'class-transformer';
import { IsDefined, IsInstance, IsString, ValidateNested } from 'class-validator';

import { Entity } from './Entity';

export class WatcherId {
  @IsDefined()
  @IsString()
  repository!: string;

  @IsDefined()
  @IsString()
  user!: string;
}

export class Watcher extends Entity {
  // Protected fields
  static readonly __id_fields = ['repository', 'user'];
  static readonly __collection = 'watchers';

  // Entity fields
  @IsDefined()
  @IsInstance(WatcherId)
  @ValidateNested()
  @Type(() => WatcherId)
  _id!: WatcherId;
}
