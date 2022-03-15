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

  // Entity fields
  _id!: string;
  _type!: string;

  [key: string]: any;

  public get __schema(): Joi.ObjectSchema<Metadata> {
    return Joi.object<Metadata>({
      _id: Joi.string().required(),
      _type: Joi.string().required()
    });
  }
}
