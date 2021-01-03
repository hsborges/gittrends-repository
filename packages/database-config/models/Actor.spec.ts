import Actor from './Actor';
import { omit } from 'lodash';

describe('Test Model.validate() function', () => {
  test('should throw an error with empty object', () => {
    expect(() => Actor.validate({})).toThrow(Error);
  });

  test('should throw an error if no login are provided', () => {
    const data = { id: 'id', type: 'User' };
    expect(() => Actor.validate(data)).toThrow('{"missingProperty":"login"}');
  });

  test('should throw an error if a wrong type are provided', () => {
    const data = { id: 'id', type: 'Unknown', login: 'hsborges' };
    expect(() => Actor.validate(data)).toThrow('should be equal to one of the allowed values');
  });

  test('should remove additional properties', () => {
    const data = { id: 'id', type: 'User', login: 'hsborges', remove: true };
    expect(Actor.validate(data)).toMatchObject(omit(data, ['remove']));
  });

  test('should coerce types', () => {
    const date = new Date();

    const data = Actor.validate({
      id: 'id',
      type: 'User',
      login: 'hsborges',
      database_id: '12345',
      created_at: date
    });

    expect(data.database_id).toStrictEqual(12345);
    expect(data.created_at).toEqual(date.toISOString());
  });
});
