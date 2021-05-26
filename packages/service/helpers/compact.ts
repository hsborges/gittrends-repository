/*
 *  Author: Hudson S. Borges
 */
import { isArray, isPlainObject, mapValues, pickBy, isEqual } from 'lodash';

function cannotBeRemoved(value: any): boolean {
  return [null, undefined, '', {}, []].findIndex((r) => isEqual(r, value)) < 0;
}

export default function compact(object: any): any {
  if (isArray(object)) return object.map(compact).filter(cannotBeRemoved);
  if (isPlainObject(object)) return pickBy(mapValues(object, compact), cannotBeRemoved);
  return object;
}
