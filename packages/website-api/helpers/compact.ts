import * as _ from 'lodash';

export default function compact(object: unknown): unknown {
  if (_.isArray(object)) {
    const res = (object as []).map(compact).filter((value) => value);
    return _.isEmpty(res) == true ? null : res;
  }

  if (object instanceof Date) return object;

  if (_.isObject(object)) {
    const res = _.chain(object as Record<string, unknown>)
      .mapValues((value) => compact(value))
      .pickBy((value) => value)
      .value();
    return _.isEmpty(res) == true ? null : res;
  }

  return object;
}
