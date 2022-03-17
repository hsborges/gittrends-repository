/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Entity from './Entity';

export default class Release extends Entity {
  // Protected fields
  static readonly __id_fields = 'id';
  static readonly __collection = 'releases';

  // Entity fields

  _id!: string;
  repository!: string;
  author?: string;
  created_at?: Date;
  description?: string;
  is_draft?: boolean;
  is_prerelease?: boolean;
  name?: string;
  published_at?: Date;
  release_assets_count?: number;
  tag?: string;
  tag_name?: string;
  updated_at?: Date;

  public static get __schema(): Joi.ObjectSchema<Release> {
    return Joi.object<Release>({
      _id: Joi.string().required(),
      repository: Joi.string().required(),
      author: Joi.string(),
      created_at: Joi.date(),
      description: Joi.string(),
      is_draft: Joi.boolean(),
      is_prerelease: Joi.boolean(),
      name: Joi.string(),
      published_at: Joi.date(),
      release_assets_count: Joi.number(),
      tag: Joi.string(),
      tag_name: Joi.string(),
      updated_at: Joi.date()
    });
  }
}
