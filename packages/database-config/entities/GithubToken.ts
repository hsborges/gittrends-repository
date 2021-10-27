/*
 *  Author: Hudson S. Borges
 */
import { Type } from 'class-transformer';
import { IsDate, IsDefined, IsOptional, IsString } from 'class-validator';

import { Entity } from './Entity';

export class GithubToken extends Entity {
  // Protected fields
  static readonly __id_fields = 'token';
  static readonly __collection = 'github_tokens';

  // Entity fields
  @IsDefined()
  @IsString()
  token!: string;

  @IsDefined()
  @IsString()
  type!: string;

  @IsDefined()
  @IsString()
  scope!: string;

  @IsOptional()
  @IsString()
  login?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsDefined()
  @IsDate()
  @Type(() => Date)
  created_at!: Date;
}
