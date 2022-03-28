/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';
import { pick } from 'lodash';
import stackTrace from 'stack-trace';
import { v4 } from 'uuid';

import Entity from './Entity';

export default class ErrorLog extends Entity {
  // Protected fields
  static readonly __id_fields = '_id';
  static readonly __collection = '_errors';

  // Entity fields
  _id!: string;
  name?: string;
  type_name?: string;
  funtion_name?: string;
  method_name?: string;
  file_name?: string;
  line_number?: number;
  column_number?: number;
  is_native?: boolean;
  message!: string;
  stack!: string;
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

  public static get __schema(): Joi.ObjectSchema<ErrorLog> {
    return Joi.object({
      _id: Joi.string().required(),
      name: Joi.string(),
      type_name: Joi.string(),
      funtion_name: Joi.string(),
      method_name: Joi.string(),
      file_name: Joi.string(),
      line_number: Joi.number(),
      column_number: Joi.number(),
      is_native: Joi.boolean(),
      message: Joi.string().allow(''),
      stack: Joi.string(),
      created_at: Joi.date()
    });
  }
}
