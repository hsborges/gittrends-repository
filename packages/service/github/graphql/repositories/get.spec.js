/*
 *  Author: Hudson S. Borges
 */
const get = require('./get');
const { NotFoundError } = require('../../../helpers/errors.js');

describe('GraphQL Get Repository', () => {
  test('it should throw an error when no args are provided', async () => {
    await expect(get()).rejects.toThrow(TypeError);
  });

  test('it should find a repository by its name', async () => {
    const { repository } = await get('twbs', 'bootstrap');
    expect(repository.name).toEqual('bootstrap');
    expect(repository.name_with_owner).toEqual('twbs/bootstrap');
  });

  test('it should find a repository by its node id', async () => {
    const { repository } = await get('MDEwOlJlcG9zaXRvcnkyMTI2MjQ0');
    expect(repository.id).toEqual('MDEwOlJlcG9zaXRvcnkyMTI2MjQ0');
    expect(repository.name).toEqual('bootstrap');
    expect(repository.name_with_owner).toEqual('twbs/bootstrap');
  });

  test('it shoul throw an error on invalid name', async () => {
    await expect(get('12345', '12345')).rejects.toThrow(NotFoundError);
  });

  test('it shoul throw an error on invalid node id', async () => {
    await expect(get('1234567890')).rejects.toThrow(NotFoundError);
  });
});
