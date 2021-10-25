/*
 *  Author: Hudson S. Borges
 */
import { Type } from 'class-transformer';
import { IsDate, IsDefined, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

import { Entity } from './Entity';

export class Milestone extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'milestones';

  // Entity fields
  @IsDefined()
  @IsString()
  _id!: string;

  @IsDefined()
  @IsString()
  repository!: string;

  @IsOptional()
  @IsString()
  creator?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  progress_percentage?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  due_on?: Date;

  @IsOptional()
  @IsInt()
  number?: number;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  title?: string;
}
