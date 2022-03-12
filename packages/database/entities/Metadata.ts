/*
 *  Author: Hudson S. Borges
 */
import { IsDefined, IsString } from 'class-validator';

import { Entity } from './Entity';

export class Metadata extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'metadata';
  static readonly __whitelist = false;

  // Entity fields
  @IsDefined()
  @IsString()
  _id!: string;

  [key: string]: any;
}
