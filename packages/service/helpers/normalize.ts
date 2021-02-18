/*
 *  Author: Hudson S. Borges
 */
import { isArray, isPlainObject, snakeCase, has, size, mapValues, mapKeys } from 'lodash';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/i;

export default function normalize(object: any): any {
  if (isArray(object)) return object.map(normalize);

  if (isPlainObject(object)) {
    const _object = mapValues(
      mapKeys(object, (_, key) => snakeCase(key)),
      normalize
    );

    if (size(_object) === 1) {
      if (has(_object, 'id')) return _object.id;
      if (has(_object, 'name')) return _object.name;
      if (has(_object, 'target')) return _object.target;
      if (has(_object, 'total_count')) return _object.total_count;
    }

    return mapValues(_object, (value, key) => {
      if (key === 'reaction_groups' && value) {
        return value.reduce(
          (memo: TObject, v: { content: string; users_count: number }) => ({
            ...memo,
            [v.content.toLowerCase()]: v.users_count
          }),
          {}
        );
      }
      return value;
    });
  }
  if (typeof object === 'string' && DATE_REGEX.test(object)) return new Date(object);

  return object;
}
