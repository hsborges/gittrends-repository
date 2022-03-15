/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Entity from './Entity';

export default class Stargazer extends Entity {
  // Protected fields
  static readonly __id_fields = ['repository', 'user', 'starred_at'];
  static readonly __collection = 'stargazers';

  // Entity fields
  _id!: {
    repository: string;
    user: string;
    starred_at: Date;
  };

  public get __schema(): Joi.ObjectSchema<Stargazer> {
    return Joi.object<Stargazer>({
      _id: Joi.object({
        repository: Joi.string().required(),
        user: Joi.string().required(),
        starred_at: Joi.date().required()
      }).required()
    });
  }
}
