/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';
import { cloneDeep, omit, pick } from 'lodash';

export class EntityValidationError extends Error {
  public readonly errors!: string[];

  constructor(errors: string[]) {
    super(`Entity validation error.\n${JSON.stringify(errors)}`);
    this.errors = errors;
  }
}

export default abstract class Entity {
  static readonly __id_fields: string | string[];
  static readonly __collection: string;
  static readonly __strip_unknown: boolean = true;

  constructor(object?: Record<any, unknown>) {
    if (object) Object.assign(this, this.validate(object));
  }

  _id!: string | Record<string, unknown>;

  public toJSON(): Record<any, unknown> {
    return omit(cloneDeep(this));
  }

  public abstract get __schema(): Joi.ObjectSchema;

  protected validate(object: Record<string, unknown>): Record<string, unknown> {
    if (!object._id) {
      const idFields = (this.constructor as any)?.__id_fields;
      object._id = Array.isArray(idFields) ? pick(object, idFields) : object[idFields];
    }

    const stripUnknown = (this.constructor as any).__strip_unknown;
    const { error, value } = this.__schema.validate(object, {
      convert: true,
      abortEarly: false,
      stripUnknown: stripUnknown,
      allowUnknown: !stripUnknown
    });

    if (error) throw new EntityValidationError(error.details.map((e) => e.message));

    return value;
  }
}
