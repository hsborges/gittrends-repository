/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Entity from './Entity';

export default class Watcher extends Entity {
  // Protected fields
  static readonly __id_fields = ['repository', 'user'];
  static readonly __collection = 'watchers';

  // Entity fields

  _id!: {
    repository: string;
    user: string;
  };

  public static get __schema(): Joi.ObjectSchema<Watcher> {
    return Joi.object<Watcher>({
      _id: Joi.object({
        repository: Joi.string().required(),
        user: Joi.string().required()
      }).required()
    });
  }
}
