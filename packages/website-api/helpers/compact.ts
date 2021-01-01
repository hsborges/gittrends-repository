import * as _ from 'lodash';

export default function compact(object: unknown): unknown {
  if (_.isArray(object) == true) {
    const res = (object as []).map(compact);
    return _.isEmpty(res) == true ? null : res;
  }

  if (_.isPlainObject(object) == true) {
    const res = _.chain(object as Record<string, unknown>)
      .mapValues(compact)
      .pickBy((value) => value !== null)
      .value();
    return _.isEmpty(res) == true ? null : res;
  }

  return object;
}
