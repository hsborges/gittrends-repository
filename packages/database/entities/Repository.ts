/*
 *  Author: Hudson S. Borges
 */
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDefined,
  IsInstance,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested
} from 'class-validator';

import { Entity } from './Entity';

export class RepositoryFoundingLink {
  @IsDefined()
  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  platform?: string;
}

export class RepositoryLanguage {
  @IsDefined()
  @IsString()
  language!: string;

  @IsDefined()
  @IsInt()
  size!: number;
}

export class Repository extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'repositories';

  // Entity fields
  @IsDefined()
  @IsString()
  _id!: string;

  @IsOptional()
  @IsInt()
  assignable_users_count?: number;

  @IsOptional()
  @IsString()
  code_of_conduct?: string;

  @IsOptional()
  @IsString()
  contact_links?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  created_at?: Date;

  @IsOptional()
  @IsInt()
  database_id?: number;

  @IsOptional()
  @IsString()
  default_branch?: string;

  @IsOptional()
  @IsBoolean()
  delete_branch_on_merge?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  disk_usage?: number;

  @IsOptional()
  @IsInt()
  forks_count?: number;

  @IsOptional()
  @IsInstance(RepositoryFoundingLink, { each: true })
  @ValidateNested({ each: true })
  @Type(() => RepositoryFoundingLink)
  funding_links?: RepositoryFoundingLink[];

  @IsOptional()
  @IsBoolean()
  has_issues_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  has_projects_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  has_wiki_enabled?: boolean;

  @IsOptional()
  @IsString()
  homepage_url?: string;

  @IsOptional()
  @IsBoolean()
  is_archived?: boolean;

  @IsOptional()
  @IsBoolean()
  is_blank_issues_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  is_disabled?: boolean;

  @IsOptional()
  @IsBoolean()
  is_empty?: boolean;

  @IsOptional()
  @IsBoolean()
  is_fork?: boolean;

  @IsOptional()
  @IsBoolean()
  is_in_organization?: boolean;

  @IsOptional()
  @IsBoolean()
  is_locked?: boolean;

  @IsOptional()
  @IsBoolean()
  is_mirror?: boolean;

  @IsOptional()
  @IsBoolean()
  is_private?: boolean;

  @IsOptional()
  @IsBoolean()
  is_security_policy_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  is_template?: boolean;

  @IsOptional()
  @IsBoolean()
  is_user_configuration_repository?: boolean;

  @IsOptional()
  @IsInt()
  issues_count?: number;

  @IsOptional()
  @IsInt()
  labels_count?: number;

  @IsOptional()
  @IsInstance(RepositoryLanguage, { each: true })
  @ValidateNested({ each: true })
  @Type(() => RepositoryLanguage)
  languages?: RepositoryLanguage[];

  @IsOptional()
  @IsString()
  license_info?: string;

  @IsOptional()
  @IsString()
  lock_reason?: string;

  @IsOptional()
  @IsInt()
  mentionable_users_count?: number;

  @IsOptional()
  @IsBoolean()
  merge_commit_allowed?: boolean;

  @IsOptional()
  @IsInt()
  milestones_count?: number;

  @IsOptional()
  @IsString()
  mirror_url?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsDefined()
  @IsString()
  name_with_owner!: string;

  @IsOptional()
  @IsString()
  open_graph_image_url?: string;

  @IsDefined()
  @IsString()
  owner!: string;

  @IsOptional()
  @IsString()
  parent?: string;

  @IsOptional()
  @IsString()
  primary_language?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  pushed_at?: Date;

  @IsOptional()
  @IsInt()
  pull_requests_count?: number;

  @IsOptional()
  @IsBoolean()
  rebase_merge_allowed?: boolean;

  @IsOptional()
  @IsInt()
  releases_count?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  repository_topics?: string[];

  @IsOptional()
  @IsBoolean()
  squash_merge_allowed?: boolean;

  @IsOptional()
  @IsInt()
  stargazers_count?: number;

  @IsOptional()
  @IsString()
  template_repository?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updated_at?: Date;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsBoolean()
  uses_custom_open_graph_image?: boolean;

  @IsOptional()
  @IsInt()
  vulnerability_alerts_count?: number;

  @IsOptional()
  @IsInt()
  watchers_count?: number;

  // entity metadata
  @IsOptional()
  @IsObject()
  _metadata?: Record<string, any>;
}
