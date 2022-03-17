/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Entity from './Entity';

export default class Reaction extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'reactions';

  // Entity fields

  _id!: string;
  repository!: string;
  issue!: string;
  event?: string;
  content!: string;
  created_at!: Date;
  user?: string;

  public static get __schema(): Joi.ObjectSchema<Reaction> {
    return Joi.object({
      _id: Joi.string().required(),
      repository: Joi.string().required(),
      issue: Joi.string().required(),
      event: Joi.string(),
      content: Joi.string().required(),
      created_at: Joi.date(),
      user: Joi.string()
    });
  }
}
