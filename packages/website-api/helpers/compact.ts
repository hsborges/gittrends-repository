import { isArray, isObject, chain } from 'lodash';

export default function compact(object: unknown): unknown {
  if (isArray(object)) return (object as []).map(compact).filter((value) => value);

  if (object instanceof Date) return object;

  if (isObject(object))
    return chain(object as Record<string, unknown>)
      .mapValues((value) => compact(value))
      .pickBy((value) => value)
      .value();

  return object;
}
