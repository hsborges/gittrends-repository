/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Entity from './Entity';

export default class Metadata extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'metadata';
  static readonly __strip_unknown: boolean = false;
  static readonly __convert: boolean = false;

  // Entity fields
  _id!: string;

  [key: string]: any;

  public static get __schema(): Joi.ObjectSchema<Metadata> {
    return Joi.object<Metadata>({ _id: Joi.string().required() });
  }
}
