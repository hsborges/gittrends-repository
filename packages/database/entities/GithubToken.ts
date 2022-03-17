/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Entity from './Entity';

export default class GithubToken extends Entity {
  // Protected fields
  static readonly __id_fields = 'token';
  static readonly __collection = 'github_tokens';

  // Entity fields
  token!: string;
  type!: string;
  scope!: string;
  login?: string;
  email?: string;
  created_at!: Date;

  public static get __schema(): Joi.ObjectSchema<GithubToken> {
    return Joi.object<GithubToken>({
      token: Joi.string().required(),
      type: Joi.string().required(),
      scope: Joi.string().required(),
      login: Joi.string(),
      email: Joi.string(),
      created_at: Joi.date().required()
    });
  }
}
