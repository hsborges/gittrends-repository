/*
 *  Author: Hudson S. Borges
 */
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDefined,
  IsIn,
  IsInstance,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested
} from 'class-validator';

import { Entity } from './Entity';

export class ActorStatus {
  @IsDefined()
  @IsDate()
  @Type(() => Date)
  created_at!: Date;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expires_at?: Date;

  @IsOptional()
  @IsBoolean()
  indicates_limited_availability?: boolean;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updated_at?: Date;
}

export class Actor extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'actors';

  // Entity fields
  @IsDefined()
  @IsString()
  _id!: string;

  @IsDefined()
  @IsIn(['User', 'Organization', 'Mannequin', 'Bot', 'EnterpriseUserAccount'])
  type!: 'User' | 'Organization' | 'Mannequin' | 'Bot' | 'EnterpriseUserAccount';

  @IsDefined()
  @IsString()
  login!: string;

  // Shared properties
  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  created_at?: Date;

  @IsOptional()
  @IsNumber()
  database_id?: number;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  repositories_count?: number;

  @IsOptional()
  @IsString()
  twitter_username?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updated_at?: Date;

  @IsOptional()
  @IsString()
  website_url?: string;

  // User
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsInt()
  followers_count?: number;

  @IsOptional()
  @IsInt()
  following_count?: number;

  @IsOptional()
  @IsInt()
  gists_count?: number;

  @IsOptional()
  @IsBoolean()
  is_bounty_hunter?: boolean;

  @IsOptional()
  @IsBoolean()
  is_campus_expert?: boolean;

  @IsOptional()
  @IsBoolean()
  is_developer_program_member?: boolean;

  @IsOptional()
  @IsBoolean()
  is_employee?: boolean;

  @IsOptional()
  @IsBoolean()
  is_hireable?: boolean;

  @IsOptional()
  @IsBoolean()
  is_site_admin?: boolean;

  @IsOptional()
  @IsInt()
  projects_count?: number;

  @IsOptional()
  @IsUrl()
  projects_url?: string;

  @IsOptional()
  @IsInt()
  repositories_contributed_to_count?: number;

  @IsOptional()
  @IsInt()
  starred_repositories_count?: number;

  @IsOptional()
  @IsInstance(ActorStatus)
  @ValidateNested()
  @Type(() => ActorStatus)
  status?: ActorStatus;

  @IsOptional()
  @IsInt()
  watching_count?: number;

  // Organization
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;

  @IsOptional()
  @IsInt()
  members_with_role_count?: number;

  @IsOptional()
  @IsInt()
  teams_count?: number;

  // EnterpriseUserAccount
  @IsOptional()
  @IsString()
  enterprise?: string;

  @IsOptional()
  @IsString()
  user?: string;

  // entity metadata
  @IsOptional()
  @IsObject()
  _metadata?: Record<string, any>;
}
