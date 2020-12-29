/*
 *  Author: Hudson S. Borges
 */
const axios = require('axios');
const retry = require('retry');
const UserAgent = require('user-agents');
const Errors = require('../../helpers/errors.js');

const PROTOCOL = process.env.GITTRENDS_PROXY_PROTOCOL || 'http';
const HOST = process.env.GITTRENDS_PROXY_HOST || 'localhost';
const PORT = parseInt(process.env.GITTRENDS_PROXY_PORT || 3000, 10);
const TIMEOUT = parseInt(process.env.GITTRENDS_PROXY_TIMEOUT || Number.MAX_SAFE_INTEGER, 10);
const RETRIES = parseInt(process.env.GITTRENDS_PROXY_RETRIES || 5, 10);
const USER_AGENT = process.env.GITTRENDS_PROXY_USER_AGENT || new UserAgent().random().toString();

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
module.exports.post = async function (parameters) {
  return new Promise((resolve, reject) => {
    const operation = retry.operation({
      retries: RETRIES,
      randomize: true,
      minTimeout: 100,
      maxTimeout: 500
    });

    operation.attempt(() =>
      requestClient({ method: 'post', data: parameters })
        .then(resolve)
        .catch((err) => {
          if (err.code === 'ECONNABORTED' && operation.retry(err)) return;
          if (err.code === 'ECONNREFUSED' && operation.retry(err)) return;
          if (err.response && /500/g.test(err.response.status) && operation.retry(err)) return;
          return reject(operation.mainError() || err);
        })
    );
  })
    .catch((err) => {
      const params = [err.message, err, parameters.variables, err.response && err.response.data];
      if (err.response && err.response.status === 502) {
        throw new Errors.BadGatewayError(...params);
      }
      if ((err.response && err.response.status === 408) || err.code === 'ECONNABORTED') {
        throw new Errors.TimedoutError(...params);
      }
      throw err;
    })
    .then(async ({ data, headers }) => {
      if (data && data.errors && data.errors.length) {
        const errorsStr = JSON.stringify(data.errors, null, 2);
        const message = `Github response contains ${data.errors.length} errors:\n${errorsStr}`;
        const params = [message, null, parameters.variables, data];
        if (data.errors.find((e) => e.type === 'FORBIDDEN'))
          throw new Errors.ForbiddenError(...params);
        if (data.errors.find((e) => e.type === 'INTERNAL'))
          throw new Errors.InternalError(...params);
        if (data.errors.find((e) => e.type === 'NOT_FOUND'))
          throw new Errors.NotFoundError(...params);
        if (data.errors.find((e) => e.type === 'MAX_NODE_LIMIT_EXCEEDED'))
          throw new Errors.MaxNodeLimitExceededError(...params);
        if (data.errors.find((e) => e.type === 'SERVICE_UNAVAILABLE'))
          throw new Errors.ServiceUnavailableError(...params);
        if (data.errors.find((e) => e.message === 'timedout'))
          throw new Errors.TimedoutError(...params);
        if (data.errors.find((e) => e.message === 'loading'))
          throw new Errors.LoadingError(...params);
        if (data.errors.find((e) => /^something.went.wrong.+/i.test(e.message)))
          throw new Errors.SomethingWentWrongError(...params);
        throw new Errors.RequestError(...params);
      }
      return Promise.resolve({ data, headers });
    });
};
