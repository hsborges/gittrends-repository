/*
 *  Author: Hudson S. Borges
 */
import { isArray, isPlainObject, reduce, isEqual } from 'lodash';

const valuesToRemove = [null, undefined, '', {}, []];

export default function compact(object: any): any {
  if (isArray(object)) {
    const _object = object
      .map((value) => compact(value))
      .filter((o) => valuesToRemove.findIndex((r) => isEqual(r, o)) < 0);
    return _object;
  }

  if (isPlainObject(object))
    return reduce(
      object as Record<string, any>,
      (acc, value, key) => {
        const _value = compact(value);
        return valuesToRemove.findIndex((r) => isEqual(r, _value)) < 0
          ? { ...acc, [key]: _value }
          : acc;
      },
      {}
    );

  return object;
}
