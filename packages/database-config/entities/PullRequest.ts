/*
 *  Author: Hudson S. Borges
 */
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf
} from 'class-validator';
import { isString } from 'lodash';

import { Issue } from './Issue';

export class PullRequest extends Issue {
  @IsOptional()
  @IsString({ each: true })
  suggested_reviewers?: string[];

  @IsOptional()
  @IsInt()
  additions?: number;

  @IsOptional()
  @IsObject()
  base_ref?: { name?: string; target?: string };

  @IsOptional()
  @IsString()
  base_ref_name?: string;

  @IsOptional()
  @IsString()
  base_ref_oid?: string;

  @IsOptional()
  @IsString()
  base_repository?: string;

  @IsOptional()
  @IsBoolean()
  can_be_rebased?: boolean;

  @IsOptional()
  @IsInt()
  changed_files?: number;

  @IsOptional()
  @IsInt()
  deletions?: number;

  @IsOptional()
  @IsObject()
  @ValidateIf((o, v) => !isString(v))
  head_ref?: { name?: string; target?: string } | string;

  @IsOptional()
  @IsString()
  head_ref_name?: string;

  @IsOptional()
  @IsString()
  head_ref_oid?: string;

  @IsOptional()
  @IsString()
  head_repository?: string;

  @IsOptional()
  @IsString()
  head_repository_owner?: string;

  @IsOptional()
  @IsBoolean()
  is_cross_repository?: boolean;

  @IsOptional()
  @IsBoolean()
  is_draft?: boolean;

  @IsOptional()
  @IsBoolean()
  maintainer_can_modify?: boolean;

  @IsOptional()
  @IsString()
  merge_commit?: string;

  @IsOptional()
  @IsString()
  merge_state_status?: string;

  @IsOptional()
  @IsString()
  mergeable?: string;

  @IsOptional()
  @IsBoolean()
  merged?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  merged_at?: Date;

  @IsOptional()
  @IsString()
  merged_by?: string;

  @IsOptional()
  @IsString()
  permalink?: string;

  @IsOptional()
  @IsString()
  potential_merge_commit?: string;
}
