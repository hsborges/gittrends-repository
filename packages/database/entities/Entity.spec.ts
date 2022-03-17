/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Entity from './Entity';

class FakeEntity extends Entity {
  static readonly __id_fields = 'id';
  static readonly __collection = 'fake_entity';

  _id!: string;
  number?: number;
  date?: Date;
  nested?: { _id: string; value?: string };

  static get __schema() {
    return Joi.object<FakeEntity>({
      _id: Joi.string().required(),
      number: Joi.number(),
      date: Joi.date(),
      nested: Joi.object({
        _id: Joi.string().required(),
        value: Joi.string()
      })
    });
  }
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
    expect(fake.toJSON()).toStrictEqual({ _id: fake._id, number: fake.number, date: fake.date });
  });
  it('should transform string timestamps into Date objects', () => {
    const entity = new FakeEntity({ _id: '1', date: new Date().toISOString() });
    expect(entity.date).toBeDefined();
    expect(entity.date).toBeInstanceOf(Date);
  });
  it('should throw an error if required fields are not defined', () => {
    expect(() => new FakeEntity({ number: 1 })).toThrowError();
  });
  it('should validate nested entities', () => {
    const simpleObject = { _id: '1', nested: { _id: '1' } };
    expect(new FakeEntity(simpleObject).toJSON()).toStrictEqual(simpleObject);
    const nestedObject = { _id: '1', nested: { _id: '1', value: 'value' } };
    expect(new FakeEntity(nestedObject).toJSON()).toStrictEqual(nestedObject);
    const extraNestedObject = { ...nestedObject, nested: { ...nestedObject.nested, extra: 0 } };
    expect(new FakeEntity(extraNestedObject).toJSON()).toStrictEqual(nestedObject);
    expect(() => new FakeEntity({ _id: '1', nested: { value: 1 } })).toThrowError();
  });
});
