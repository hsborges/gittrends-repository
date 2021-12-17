/*
 *  Author: Hudson S. Borges
 */
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDefined,
  IsInstance,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';

import { Entity } from './Entity';

export class CommitActor {
  @IsDefined()
  @IsDate()
  @Type(() => Date)
  date!: Date;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  user?: string;
}

export class CommitSignature {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isValid?: boolean;

  @IsOptional()
  @IsString()
  signer?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsBoolean()
  wasSignedByGitHub?: boolean;
}

export class CommitStatus {
  @IsDefined()
  @IsString()
  id!: string;

  @IsOptional()
  @IsObject({ each: true })
  contexts?: Array<{ context: string; description?: string; createdAt?: Date }>;

  @IsOptional()
  @IsString()
  state?: string;
}

export class Commit extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'commits';

  // Entity fields
  @IsDefined()
  @IsString()
  _id!: string;

  @IsOptional()
  @IsString()
  repository!: string;

  @IsOptional()
  @IsInt()
  additions?: number;

  @IsOptional()
  @IsInstance(CommitActor)
  @ValidateNested()
  @Type(() => CommitActor)
  author?: CommitActor;

  @IsOptional()
  @IsBoolean()
  authored_by_committer?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  authored_date?: Date;

  @IsOptional()
  @IsInt()
  changed_files?: number;

  @IsOptional()
  @IsInt()
  comments_count?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  committed_date?: Date;

  @IsOptional()
  @IsBoolean()
  committed_via_web?: boolean;

  @IsOptional()
  @IsInstance(CommitActor)
  @ValidateNested()
  @Type(() => CommitActor)
  committer?: CommitActor;

  @IsOptional()
  @IsInt()
  deletions?: number;

  @IsOptional()
  @IsString()
  message?: string;

  @IsDefined()
  @IsString()
  oid!: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  pushed_date?: Date;

  @IsOptional()
  @IsInstance(CommitSignature)
  @ValidateNested()
  @Type(() => CommitSignature)
  signature?: CommitSignature;

  @IsOptional()
  @IsInstance(CommitStatus)
  @ValidateNested()
  @Type(() => CommitStatus)
  status?: CommitStatus;
}
