/*
 *  Author: Hudson S. Borges
 */
import { IsDefined, IsOptional, IsString } from 'class-validator';

import { Entity } from './Entity';

export class Location extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'locations';

  // Entity fields
  @IsDefined()
  @IsString()
  _id!: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  country_code?: string;

  @IsOptional()
  @IsString()
  country_name?: string;

  @IsOptional()
  @IsString()
  state_code?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsString()
  city?: string;
}
