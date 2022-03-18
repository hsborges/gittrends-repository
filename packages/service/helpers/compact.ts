/*
 *  Author: Hudson S. Borges
 */
import { isArray, isPlainObject, mapValues, pickBy, isNil, size, negate } from 'lodash';

export function canBeRemoved(value: any): boolean {
  if (isNil(value)) return true;
  else if (value === false || value === 0 || value === '') return true;
  else if ((isArray(value) || isPlainObject(value)) && size(value) === 0) return true;
  return false;
}

export const cannotBeRemoved = negate(canBeRemoved);

export default function compact(object: any, depth: number = Number.MAX_SAFE_INTEGER): any {
  if (depth < 0) {
    return object;
  } else if (isArray(object)) {
    return object.map((value) => compact(value, depth - 1)).filter(cannotBeRemoved);
  } else if (isPlainObject(object)) {
    return pickBy(
      mapValues(object, (value) => compact(value, depth - 1)),
      cannotBeRemoved
    );
  }
  return object;
}
