/*
 *  Author: Hudson S. Borges
 */
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDefined,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString
} from 'class-validator';

import { Entity } from './Entity';

export class Issue extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'issues';

  // Entity fields
  @IsDefined()
  @IsString()
  _id!: string;

  @IsDefined()
  @IsString()
  repository!: string;

  @IsDefined()
  @IsString()
  @IsIn(['Issue', 'PullRequest'])
  type!: 'Issue' | 'PullRequest';

  @IsOptional()
  @IsString()
  active_lock_reason?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  author_association?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsBoolean()
  closed?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  closed_at?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  created_at?: Date;

  @IsOptional()
  @IsBoolean()
  created_via_email?: boolean;

  @IsOptional()
  @IsInt()
  database_id?: number;

  @IsOptional()
  @IsString()
  editor?: string;

  @IsOptional()
  @IsBoolean()
  includes_created_edit?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  last_edited_at?: Date;

  @IsOptional()
  @IsBoolean()
  locked?: boolean;

  @IsOptional()
  @IsString()
  milestone?: string;

  @IsOptional()
  @IsInt()
  number?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  published_at?: Date;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updated_at?: Date;

  @IsOptional()
  @IsString({ each: true })
  assignees?: string[];

  @IsOptional()
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsString({ each: true })
  participants?: string[];

  @IsOptional()
  @IsObject()
  reaction_groups?: Record<string, any>;

  // entity metadata
  @IsOptional()
  @IsObject()
  _metadata?: Record<string, any>;
}
