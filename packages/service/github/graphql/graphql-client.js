/*
 *  Author: Hudson S. Borges
 */
const _ = require('lodash');
const dayjs = require('dayjs');
const axios = require('axios');
const pRetry = require('promise-retry');
const UserAgent = require('user-agents');
const compact = require('../../helpers/compact.js');
const Errors = require('../../helpers/errors.js');

const PROTOCOL = process.env.GITTRENDS_PROXY_PROTOCOL || 'http';
const HOST = process.env.GITTRENDS_PROXY_HOST || 'localhost';
const PORT = parseInt(process.env.GITTRENDS_PROXY_PORT || 3000, 10);
const TIMEOUT = parseInt(process.env.GITTRENDS_PROXY_TIMEOUT || 15000, 10);
const RETRIES = parseInt(process.env.GITTRENDS_PROXY_RETRIES || 5, 10);
const USER_AGENT = process.env.GITTRENDS_PROXY_USER_AGENT || new UserAgent().random().toString();

function normalize(object) {
  if (_.isArray(object)) return object.map(normalize);
  if (_.isPlainObject(object)) {
    return _.reduce(
      object,
      (memo, value, key) => {
        const _value = normalize(value);
        const _key = _.snakeCase(key);
        const _memo = { ...memo };

        if (_value && _.has(_value, 'total_count')) {
          _.set(_memo, `${_key}_count`, _value.total_count);
        } else if (
          _.endsWith(_key, '_at') ||
          _.endsWith(_key, '_on') ||
          _.endsWith(_key, '_date') ||
          _key === 'date'
        ) {
          const m = dayjs(_value);
          _memo[_key] = m.isValid() ? m.toDate() : _value;
        } else {
          _memo[_key] = _value;
        }

        return _memo;
      },
      {}
    );
  }
  return object;
}

const requestClient = axios.create({
  baseURL: `${PROTOCOL}://${HOST}:${PORT}/graphql`,
  responseType: 'json',
  timeout: TIMEOUT,
  headers: {
    'user-agent': USER_AGENT,
    'accept-encoding': 'gzip',
    accept: [
      'application/vnd.github.starfox-preview+json',
      'application/vnd.github.hawkgirl-preview+json',
      'application/vnd.github.merge-info-preview+json'
    ].join(', ')
  }
});

/* exports */
module.exports.post = async (parameters) => {
  return pRetry(
    (retry) =>
      requestClient({ method: 'post', data: parameters }).catch((err) => {
        if (err.response && err.response.status === 502) throw err;
        return retry(err);
      }),
    { retries: RETRIES, randomize: true }
  )
    .catch((err) => {
      if (err.response && err.response.status === 502) {
        const params = [err.message, err, parameters.variables, err.response.data];
        throw new Errors.BadGatewayError(...params);
      }
      throw err;
    })
    .then(({ data, headers }) => compact(normalize({ data, headers })))
    .then(async ({ data, headers }) => {
      if (data && data.errors && data.errors.length) {
        const errorsStr = JSON.stringify(data.errors, null, 2);
        const message = `Github response contains ${data.errors.length} errors:\n${errorsStr}`;
        const params = [message, null, parameters.variables, data];
        if (data.errors.find((e) => e.type === 'NOT_FOUND'))
          throw new Errors.NotFoundError(...params);
        if (data.errors.find((e) => e.type === 'SERVICE_UNAVAILABLE'))
          throw new Errors.ServiceUnavailableError(...params);
        if (data.errors.find((e) => e.message === 'timedout'))
          throw new Errors.TimedoutError(...params);
        if (data.errors.find((e) => e.message === 'loading'))
          throw new Errors.LoadingError(...params);
        throw new Errors.RequestError(...params);
      }
      return Promise.resolve({ data, headers });
    });
};
