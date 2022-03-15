import { omit, pick } from 'lodash';

import Dependency from './Dependency';

describe('Test Dependency entity.', () => {
  it('should parse commits', () => {
    const source = {
      repository: 'MDEwOlJlcG9zaXRvcnkyMTczNzQ2NQ==',
      manifest: 'MDIzOkRlcGVuZGVuY3lHcmFwaE1hbmlmZXN0MjE3Mzc0NjU6MzgyMDYwMjc3',
      package_name: 'actions/checkout',
      filename: '.github/workflows/main.yml',
      has_dependencies: false,
      package_manager: 'ACTIONS',
      target_repository: {
        id: 'MDEwOlJlcG9zaXRvcnkxOTc4MTQ2Mjk=',
        database_id: 197814629,
        name_with_owner: 'actions/checkout'
      },
      requirements: '= 2'
    };

    const result = {
      _id: pick(source, ['repository', 'manifest', 'package_name']),
      ...omit(source, ['repository', 'manifest', 'package_name'])
    };

    const commitInstance = new Dependency(source).toJSON();
    expect(commitInstance).toStrictEqual(result);
    expect(Object.keys(commitInstance)).toHaveLength(Object.keys(result).length);
  });
});
