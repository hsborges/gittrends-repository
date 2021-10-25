/*
 *  Author: Hudson S. Borges
 */
import { Type } from 'class-transformer';
import {
  IsDate,
  IsDefined,
  IsInstance,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  isString,
  ValidateIf,
  ValidateNested
} from 'class-validator';

import { entityToPlain, plainToEntity, validate, Entity } from '.';

class FakeNestedEntity {
  @IsDefined()
  @IsString()
  _id!: string;

  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;
}

class FakeEntity extends Entity {
  static readonly __id_fields = 'id';
  static readonly __collection = 'fake_entity';

  @IsDefined()
  @IsString()
  _id!: string;

  @IsOptional()
  @IsNumber()
  number?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @IsOptional()
  @IsInstance(FakeNestedEntity)
  @ValidateNested()
  @Type(() => FakeNestedEntity)
  nested?: FakeNestedEntity;

  @IsOptional()
  @IsObject()
  @ValidateIf((o, v) => !isString(v))
  object?: Record<string, any> | string;
}

describe('Test entity transformations.', () => {
  it('should transform a plain object into a Entity instance', () => {
    expect(plainToEntity(FakeEntity, { _id: '1' })).toBeInstanceOf(FakeEntity);
  });

  it('should create an "_id" field if not exists', () => {
    expect(plainToEntity(FakeEntity, { id: '1' })).toHaveProperty('_id', '1');
  });

  it('should exclude extraneus values when transforming', () => {
    const sample = { id: '1', other: 'value' };
    const fakeEntity = plainToEntity(FakeEntity, sample);
    expect(fakeEntity).not.toHaveProperty('id', 1);
    expect(fakeEntity).not.toHaveProperty('other', 'value');
  });

  it('should transform an Entity instance into a plain object', () => {
    const fake = new FakeEntity();
    fake._id = '1';
    fake.number = 2;
    expect(entityToPlain(fake)).toStrictEqual({ _id: fake._id, number: fake.number });
  });

  it('should transform string timestamps into Date objects', () => {
    const entity = plainToEntity(FakeEntity, { _id: '1', date: new Date().toISOString() });
    expect(entity.date).toBeDefined();
    expect(entity.date).toBeInstanceOf(Date);
  });

  it('should transform nested entities', () => {
    const entity = plainToEntity(FakeEntity, {
      _id: '1',
      nested: { _id: '1', key: 'value', date: new Date().toISOString() }
    });
    expect(entity.nested).toBeDefined();
    expect(entity.nested).toBeInstanceOf(FakeNestedEntity);
    expect(entity.nested?.date).toBeInstanceOf(Date);
  });

  it('should throw an error if required fields are not defined', () => {
    expect(() => plainToEntity(FakeEntity, { number: 1 })).toThrowError();
    expect(() => plainToEntity(FakeEntity, { _id: '1', nested: { key: 'value' } })).toThrowError();
  });

  it('should accept and multiple types on properties', () => {
    expect(() => plainToEntity(FakeEntity, { _id: '1', object: { k: 'v' } })).not.toThrowError();
    expect(() => plainToEntity(FakeEntity, { _id: '1', object: 'value' })).not.toThrowError();
  });
});

describe('Test entity validation', () => {
  it('should validate any entity', () => {
    const entity = new FakeEntity();
    expect(validate(entity)).toHaveLength(1);
    entity._id = 'id';
    expect(validate(entity)).toHaveLength(0);
  });
});
