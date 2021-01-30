import { decode } from 'utf8';
import { isArray, isObject, chain } from 'lodash';

export default function decodeText(object: unknown): unknown {
  if (object instanceof Date) return object;
  if (typeof object === 'string') return decode(object);

  if (isArray(object)) return (object as []).map(decodeText).filter((value) => value);

  if (isObject(object))
    return chain(object as Record<string, unknown>)
      .mapValues((value) => decodeText(value))
      .value();

  return object;
}
