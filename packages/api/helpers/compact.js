const _ = require('lodash');

module.exports = (object) => {
  if (_.isArray(object)) {
    const res = object.map(module.exports);
    return _.isEmpty(res) ? null : res;
  }

  if (_.isPlainObject(object)) {
    const res = _.chain(object)
      .mapValues(module.exports)
      .pickBy((v) => v !== null)
      .value();
    return _.isEmpty(res) ? null : res;
  }

  return object;
};
