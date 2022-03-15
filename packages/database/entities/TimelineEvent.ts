/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Entity from './Entity';

export default class TimelineEvent extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'timeline';
  static readonly __strip_unknown: boolean = false;

  // Entity fields
  _id!: string;
  repository!: string;
  issue!: string;
  type!: string;

  public get __schema(): Joi.ObjectSchema<TimelineEvent> {
    return Joi.object<TimelineEvent>({
      _id: Joi.string().required(),
      repository: Joi.string().required(),
      issue: Joi.string().required(),
      type: Joi.string().required()
    });
  }
}
