/*
 *  Author: Hudson S. Borges
 */
import { isArray, isPlainObject, size, mapValues, negate, isNil, reduce } from 'lodash';

import { cannotBeRemoved } from './compact';

const notNil = negate(isNil);

const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/i;

export default function normalize(object: any, compact: boolean = false): any {
  if (isArray(object)) {
    return object
      .map((value) => normalize(value, compact))
      .filter((value) => (compact ? cannotBeRemoved(value) : true));
  }

  if (isPlainObject(object)) {
    const _object = reduce(
      object,
      (memo: Record<string, any>, value, key) => {
        const normalizedValue = normalize(value, compact);
        return Object.assign(
          memo,
          cannotBeRemoved(normalizedValue) ? { [camelToSnakeCase(key)]: normalizedValue } : {}
        );
      },
      {}
    );

    if (size(_object) === 1) {
      if (notNil(_object.id)) return _object.id;
      if (notNil(_object.name)) return _object.name;
      if (notNil(_object.target)) return _object.target;
      if (notNil(_object.total_count)) return _object.total_count;
    }

    return mapValues(_object, (value, key) => {
      if (key === 'reaction_groups' && value) {
        return value.reduce(
          (memo: TObject, v: { content: string; users: number }) =>
            v.users === 0 ? memo : { ...memo, [v.content.toLowerCase()]: v.users },
          {}
        );
      }

      if (
        /((_|^)date|_(at|on))$/gi.test(key) &&
        typeof value === 'string' &&
        DATE_REGEX.test(value)
      ) {
        return new Date(value);
      }

      return value;
    });
  }

  return object;
}
