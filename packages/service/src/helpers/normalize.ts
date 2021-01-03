import dayjs from 'dayjs';
import { isArray, isPlainObject, snakeCase, reduce, has, size } from 'lodash';

type IObject = Record<string, unknown>;

export default function normalize(object: unknown): unknown {
  if (isArray(object)) return object.map(normalize);
  if (isPlainObject(object)) {
    return reduce(
      object as IObject,
      (memo: IObject, value: unknown, key: string) => {
        const _value = normalize(value);
        const _key = snakeCase(key);

        if (_value && has(_value, 'total_count') && size(_value as IObject) === 1) {
          memo[`${_key}_count`] = (_value as IObject).total_count;
        } else if (
          _key.endsWith('_at') ||
          _key.endsWith('_on') ||
          _key.endsWith('_date') ||
          _key === 'date'
        ) {
          const m = dayjs(_value as string);
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
}
