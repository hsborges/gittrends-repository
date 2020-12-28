/*
 *  Author: Hudson S. Borges
 */
const { isArray, isPlainObject, reduce, isEqual } = require('lodash');

const valuesToRemove = [null, undefined, '', {}, []];

module.exports = function (object) {
  if (isArray(object)) {
    const _object = object
      .map(module.exports)
      .filter((o) => valuesToRemove.indexOf((r) => isEqual(r, o)) < 0);
    return _object;
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
      {}
    );

  return object;
};
