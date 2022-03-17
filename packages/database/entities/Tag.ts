/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Entity from './Entity';

export default class Tag extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'tags';

  // Entity fields
  _id!: string;
  repository!: string;
  name!: string;
  oid?: string;
  message?: string;
  tagger?: {
    date: Date;
    email?: string;
    name?: string;
    user?: string;
  };
  target?: string;

  public static get __schema(): Joi.ObjectSchema<Tag> {
    return Joi.object<Tag>({
      _id: Joi.string().required(),
      repository: Joi.string().required(),
      name: Joi.string().required(),
      oid: Joi.string(),
      message: Joi.string(),
      tagger: Joi.object({
        date: Joi.date().required(),
        email: Joi.string(),
        name: Joi.string(),
        user: Joi.string()
      }),
      target: Joi.string()
    });
  }
}
