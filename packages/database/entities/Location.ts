/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Entity from './Entity';

export default class Location extends Entity {
  // Protected fields
  static readonly __id_fields = 'location';
  static readonly __collection = 'locations';

  // Entity fields
  _id!: string;
  label?: string;
  country_code?: string;
  country_name?: string;
  state_code?: string;
  state?: string;
  county?: string;
  city?: string;

  public static get __schema(): Joi.ObjectSchema<Location> {
    return Joi.object<Location>({
      _id: Joi.string().required(),
      label: Joi.string(),
      country_code: Joi.string(),
      country_name: Joi.string(),
      state_code: Joi.string(),
      state: Joi.string(),
      county: Joi.string(),
      city: Joi.string()
    });
  }
}
