import * as _ from 'lodash';

export default function compact(object: unknown): unknown {
  if (_.isArray(object)) return (object as []).map(compact).filter((value) => value);

  if (object instanceof Date) return object;

  if (_.isObject(object))
    return _.chain(object as Record<string, unknown>)
      .mapValues((value) => compact(value))
      .pickBy((value) => value)
      .value();

  return object;
}
