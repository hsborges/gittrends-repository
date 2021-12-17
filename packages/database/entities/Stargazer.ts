/*
 *  Author: Hudson S. Borges
 */
import { Type } from 'class-transformer';
import { IsDate, IsDefined, IsInstance, IsString, ValidateNested } from 'class-validator';

import { Entity } from './Entity';

export class StargazerId {
  @IsDefined()
  @IsString()
  repository!: string;

  @IsDefined()
  @IsString()
  user!: string;

  @IsDefined()
  @IsDate()
  @Type(() => Date)
  starred_at!: Date;
}

export class Stargazer extends Entity {
  // Protected fields
  static readonly __id_fields = ['repository', 'user', 'starred_at'];
  static readonly __collection = 'stargazers';

  // Entity fields
  @IsDefined()
  @IsInstance(StargazerId)
  @ValidateNested()
  @Type(() => StargazerId)
  _id!: StargazerId;
}
