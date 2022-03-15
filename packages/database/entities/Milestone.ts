/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Entity from './Entity';

export default class Milestone extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'milestones';

  // Entity fields

  _id!: string;
  repository!: string;
  creator?: string;
  description?: string;
  progress_percentage?: number;
  due_on?: Date;
  number?: number;
  state?: string;
  title?: string;

  public get __schema(): Joi.ObjectSchema<Milestone> {
    return Joi.object({
      _id: Joi.string().required(),
      repository: Joi.string().required(),
      creator: Joi.string(),
      description: Joi.string(),
      progress_percentage: Joi.number(),
      due_on: Joi.date(),
      number: Joi.number(),
      state: Joi.string(),
      title: Joi.string()
    });
  }
}
