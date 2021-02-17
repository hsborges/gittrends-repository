/*
 *  Author: Hudson S. Borges
 */
import { isArray, isPlainObject, reduce, isEqual } from 'lodash';

function canBeRemoved(value: any): boolean {
  return [null, undefined, '', {}, []].findIndex((r) => isEqual(r, value)) >= 0;
}

function cannotBeRemoved(value: any): boolean {
  return !canBeRemoved(value);
}

export default function compact(object: any): any {
  if (isArray(object)) return object.map((value) => compact(value)).filter(cannotBeRemoved);

  if (isPlainObject(object))
    return reduce(
      object,
      (acc, value, key) => {
        const _value = compact(value);
        return cannotBeRemoved(_value) ? { ...acc, [key]: _value } : acc;
      },
      {}
    );

  return object;
}
