/*
 *  Author: Hudson S. Borges
 */
import { Type } from 'class-transformer';
import { IsDefined, IsInstance, IsOptional, IsString, ValidateNested } from 'class-validator';

import { CommitActor } from './Commit';
import { Entity } from './Entity';

export class Tag extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'tags';

  // Entity fields
  @IsDefined()
  @IsString()
  _id!: string;

  @IsDefined()
  @IsString()
  repository!: string;

  @IsDefined()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  oid?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsInstance(CommitActor)
  @ValidateNested()
  @Type(() => CommitActor)
  tagger?: CommitActor;

  @IsOptional()
  @IsString()
  target?: string;
}
