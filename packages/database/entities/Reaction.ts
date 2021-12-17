/*
 *  Author: Hudson S. Borges
 */
import { Type } from 'class-transformer';
import { IsDate, IsDefined, IsOptional, IsString } from 'class-validator';

import { Entity } from './Entity';

export class Reaction extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'reactions';

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

  @IsOptional()
  @IsString()
  event?: string;

  @IsDefined()
  @IsString()
  content!: string;

  @IsDefined()
  @IsDate()
  @Type(() => Date)
  created_at!: Date;

  @IsOptional()
  @IsString()
  user?: string;
}
