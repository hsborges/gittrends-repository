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

import { Entity } from '.';

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
  @ValidateIf((_, v) => !isString(v))
  object?: Record<string, any> | string;
}

describe('Test entity transformations.', () => {
  it('should transform a plain object into a Entity instance', () => {
    expect(new FakeEntity({ _id: '1' })).toBeInstanceOf(FakeEntity);
  });

  it('should create an "_id" field if not exists', () => {
    expect(new FakeEntity({ id: '1' })).toHaveProperty('_id', '1');
  });

  it('should exclude extraneus values when transforming', () => {
    const fakeEntity = new FakeEntity({ _id: '1', other: 'value' });
    expect(fakeEntity).not.toHaveProperty('id', 1);
    expect(fakeEntity).not.toHaveProperty('other', 'value');
  });

  it('should transform an Entity instance into a plain object', () => {
    const fake = new FakeEntity();
    fake._id = '1';
    fake.number = 2;
    expect(fake.toJSON()).toStrictEqual({ _id: fake._id, number: fake.number });
    fake.date = new Date();
    (fake as any).extra = 'extra';
    expect(fake.toJSON()).toStrictEqual({ _id: fake._id, number: fake.number, date: fake.date });
  });

  it('should transform string timestamps into Date objects', () => {
    const entity = new FakeEntity({ _id: '1', date: new Date().toISOString() });
    expect(entity.date).toBeDefined();
    expect(entity.date).toBeInstanceOf(Date);
  });

  it('should transform nested entities', () => {
    const entity = new FakeEntity({
      _id: '1',
      nested: { _id: '1', key: 'value', date: new Date().toISOString() }
    });
    expect(entity.nested).toBeDefined();
    expect(entity.nested).toBeInstanceOf(FakeNestedEntity);
    expect(entity.nested?.date).toBeInstanceOf(Date);
  });

  it('should throw an error if required fields are not defined', () => {
    expect(() => new FakeEntity({ number: 1 })).toThrowError();
    expect(() => new FakeEntity({ _id: '1', nested: { key: 'value' } })).toThrowError();
  });

  it('should accept and multiple types on properties', () => {
    expect(() => new FakeEntity({ _id: '1', object: { k: 'v' } })).not.toThrowError();
    expect(() => new FakeEntity({ _id: '1', object: 'value' })).not.toThrowError();
  });
});
