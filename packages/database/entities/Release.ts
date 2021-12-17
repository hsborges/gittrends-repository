/*
 *  Author: Hudson S. Borges
 */
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsDefined, IsInt, IsOptional, IsString } from 'class-validator';

import { Entity } from './Entity';

export class Release extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'releases';

  // Entity fields
  @IsDefined()
  @IsString()
  _id!: string;

  @IsDefined()
  @IsString()
  repository!: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  created_at?: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_draft?: boolean;

  @IsOptional()
  @IsBoolean()
  is_prerelease?: boolean;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  published_at?: Date;

  @IsOptional()
  @IsInt()
  release_assets_count?: number;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  tag_name?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updated_at?: Date;
}
