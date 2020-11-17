/*
 *  Author: Hudson S. Borges
 */
const { isArray, isPlainObject, isEqual, reduce } = require('lodash');

const valuesToRemove = [null, undefined, '', {}];

module.exports = (object) => {
  if (isArray(object)) {
    const _object = object
      .map(module.exports)
      .filter((o) => valuesToRemove.findIndex((r) => isEqual(r, o)) < 0);
    return _object.length === 0 ? null : _object;
  }

  if (isPlainObject(object))
    return reduce(
      object,
      (acc, value, key) => {
        const _value = module.exports(value);
        return valuesToRemove.findIndex((r) => isEqual(r, _value)) < 0
          ? { ...acc, [key]: _value }
          : acc;
      },
      null
    );

  return object;
};
