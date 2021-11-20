/*
 *  Author: Hudson S. Borges
 */
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsDefined, IsNumber, IsOptional, IsString } from 'class-validator';
import { pick } from 'lodash';
import stackTrace from 'stack-trace';
import { v4 } from 'uuid';

import { Entity } from './Entity';

export class ErrorLog extends Entity {
  // Protected fields
  static readonly __id_fields = '_id';
  static readonly __collection = '_errors';
  static readonly __whitelist = false;

  // Entity fields
  @IsDefined()
  @IsString()
  _id!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  type_name?: string;

  @IsOptional()
  @IsString()
  funtion_name?: string;

  @IsOptional()
  @IsString()
  method_name?: string;

  @IsOptional()
  @IsString()
  file_name?: string;

  @IsOptional()
  @IsNumber()
  line_number?: number;

  @IsOptional()
  @IsNumber()
  column_number?: number;

  @IsOptional()
  @IsBoolean()
  is_native?: boolean;

  @IsDefined()
  @IsString()
  message!: string;

  @IsDefined()
  @IsString()
  stack!: string;

  @IsDefined()
  @IsDate()
  @Type(() => Date)
  created_at: Date = new Date();

  public static from(error: Error): ErrorLog {
    const data: Record<string, unknown> = {
      _id: v4(),
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...pick(error, Object.keys(error))
    };

    const [stack] = stackTrace.parse(error);
    data.column_number = stack.getColumnNumber();
    data.file_name = stack.getFileName();
    data.funtion_name = stack.getFunctionName();
    data.is_native = stack.isNative();
    data.line_number = stack.getLineNumber();
    data.method_name = stack.getMethodName();
    data.type_name = stack.getTypeName();

    return new ErrorLog(data);
  }
}
