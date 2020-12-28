const dayjs = require('dayjs');

const { isArray, isPlainObject, snakeCase, reduce, has, size } = require('lodash');

module.exports = function normalize(object) {
  if (isArray(object)) return object.map(normalize);
  if (isPlainObject(object)) {
    return reduce(
      object,
      (memo, value, key) => {
        const _value = normalize(value);
        const _key = snakeCase(key);

        if (_value && has(_value, 'total_count') && size(_value) === 1) {
          memo[`${_key}_count`] = _value.total_count;
        } else if (
          _key.endsWith('_at') ||
          _key.endsWith('_on') ||
          _key.endsWith('_date') ||
          _key === 'date'
        ) {
          const m = dayjs(_value);
          memo[_key] = m.isValid() ? m.toDate() : _value;
        } else {
          memo[_key] = _value;
        }

        return memo;
      },
      {}
    );
  }
  return object;
};
