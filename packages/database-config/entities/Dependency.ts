/*
 *  Author: Hudson S. Borges
 */
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsInstance,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested
} from 'class-validator';
import { isString } from 'lodash';

import { Entity } from './Entity';

export class DependencyId {
  @IsDefined()
  @IsString()
  repository!: string;

  @IsDefined()
  @IsString()
  manifest!: string;

  @IsDefined()
  @IsString()
  package_name!: string;
}

export class Dependency extends Entity {
  // Protected fields
  static readonly __id_fields = ['repository', 'manifest', 'package_name'];
  static readonly __collection = 'dependencies';

  // Entity fields
  @IsDefined()
  @IsInstance(DependencyId)
  @ValidateNested()
  @Type(() => DependencyId)
  _id!: DependencyId;

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsBoolean()
  has_dependencies?: boolean;

  @IsOptional()
  @IsString()
  package_manager?: string;

  @IsOptional()
  @IsObject()
  @ValidateIf((o, v) => !isString(v))
  target_repository?:
    | {
        id: string;
        database_id: number;
        name_with_owner: string;
      }
    | string;

  @IsOptional()
  @IsString()
  requirements?: string;
}
