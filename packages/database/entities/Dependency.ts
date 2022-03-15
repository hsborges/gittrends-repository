/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Entity from './Entity';

export default class Dependency extends Entity {
  // Protected fields
  static readonly __id_fields = ['repository', 'manifest', 'package_name'];
  static readonly __collection = 'dependencies';

  // Entity fields
  _id!: {
    repository: string;
    manifest: string;
    package_name: string;
  };

  filename?: string;
  has_dependencies?: boolean;
  package_manager?: string;
  target_repository?:
    | {
        id: string;
        database_id: number;
        name_with_owner: string;
      }
    | string;
  requirements?: string;

  public get __schema(): Joi.ObjectSchema<Dependency> {
    return Joi.object<Dependency>({
      _id: Joi.object({
        repository: Joi.string().required(),
        manifest: Joi.string().required(),
        package_name: Joi.string().required()
      }).required(),
      filename: Joi.string(),
      has_dependencies: Joi.boolean(),
      package_manager: Joi.string(),
      target_repository: Joi.alternatives(
        Joi.object({
          id: Joi.string().required(),
          database_id: Joi.number().required(),
          name_with_owner: Joi.string().required()
        }),
        Joi.string()
      ),
      requirements: Joi.string()
    });
  }
}
