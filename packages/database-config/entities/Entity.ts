/*
 *  Author: Hudson S. Borges
 */
import {
  ClassConstructor,
  Exclude,
  plainToClass,
  classToPlain,
  classToClass
} from 'class-transformer';
import { IsDefined, validateSync, ValidationError } from 'class-validator';
import 'es6-shim';
import { pick } from 'lodash';
import 'reflect-metadata';

export class EntityValidationError extends Error {
  public readonly errors!: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(`Entity validation error.\n${JSON.stringify(errors)}`);
    this.errors = errors;
  }
}

function validate<T extends Entity>(entity: T): ValidationError[] {
  return validateSync(entity, {
    whitelist: (entity.constructor as typeof Entity)?.__whitelist ?? true
  });
}

function plainToEntity<T extends Entity>(
  entity: ClassConstructor<T>,
  object: Record<string, unknown>
): T {
  if (!object._id) {
    const idFields = entity.prototype.constructor?.__id_fields;
    object._id = Array.isArray(idFields) ? pick(object, idFields) : object[idFields];
  }

  const classEntity = plainToClass(entity, object);
  const errors = validate(classEntity);

  if (errors?.length) throw new EntityValidationError(errors);

  return classEntity;
}

function entityToPlain<T extends Entity>(entity: T): Record<string, unknown> {
  const entityClone = classToClass(entity);
  validate(entityClone);
  return classToPlain(entityClone);
}

export abstract class Entity {
  @Exclude()
  static readonly __id_fields: string | string[];

  @Exclude()
  static readonly __collection: string;

  @Exclude()
  static readonly __whitelist: boolean = true;

  constructor(object?: Record<any, unknown>) {
    if (object) Object.assign(this, plainToEntity(this.constructor as any, object));
  }

  @IsDefined()
  _id!: any;

  @Exclude()
  public toJSON(): Record<any, unknown> {
    return entityToPlain(this);
  }
}
