/*
 *  Author: Hudson S. Borges
 */
import { ClassConstructor, Exclude, plainToClass, classToPlain } from 'class-transformer';
import { IsDefined, validateSync, ValidationError } from 'class-validator';
import 'es6-shim';
import { pick, get } from 'lodash';
import 'reflect-metadata';

export function validate<T extends Entity>(entity: T): ValidationError[] {
  return validateSync(entity, {
    whitelist: (entity.constructor as typeof Entity)?.__whitelist ?? true
  });
}

export function plainToEntity<T extends Entity>(
  entity: ClassConstructor<T>,
  object: Record<string, unknown>
): T {
  if (!object._id) {
    const idFields = get(entity.prototype.constructor, '__id_fields');
    object._id = Array.isArray(idFields) ? pick(object, idFields) : object[idFields];
  }

  const classEntity = plainToClass(entity, object);
  const errors = validate(classEntity);

  if (errors?.length) throw errors;

  return classEntity;
}

export function entityToPlain<T extends Entity>(entity: T): Record<string, unknown> {
  return classToPlain(entity);
}

export abstract class Entity {
  @Exclude()
  static readonly __id_fields: string | string[];

  @Exclude()
  static readonly __collection: string;

  @Exclude()
  static readonly __whitelist: boolean = true;

  constructor(object?: Record<any, unknown>) {
    Object.assign(this, plainToClass(this.constructor as any, object));
  }

  @IsDefined()
  _id!: any;
}
