/*
 *  Author: Hudson S. Borges
 */
import Debug from 'debug';
import UserAgent from 'user-agents';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

import compact from '../helpers/compact';
import normalize from '../helpers/normalize';
import * as Errors from '../helpers/errors';

const debug = Debug('gittrends:http-client');

const PROTOCOL = process.env.GITTRENDS_PROXY_PROTOCOL ?? 'http';
const HOST = process.env.GITTRENDS_PROXY_HOST ?? 'localhost';
const PORT = parseInt(process.env.GITTRENDS_PROXY_PORT ?? '3000', 10);
const TIMEOUT = parseInt(process.env.GITTRENDS_PROXY_TIMEOUT ?? '15000', 10);
const USER_AGENT = process.env.GITTRENDS_PROXY_USER_AGENT ?? new UserAgent().random().toString();

const requestClient: AxiosInstance = axios.create({
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
export default async function (query: TObject): Promise<AxiosResponse> {
  return requestClient({ method: 'post', data: query })
    .catch((err) => {
      debug(`Error detect when performing request (status: ${err.response.status})`);
      if (err.response && err.response.status === 500)
        throw new Errors.InternalServerError(err.message, err, err.response && err.response.data);
      if (err.response && err.response.status === 502)
        throw new Errors.BadGatewayError(err.message, err, err.response && err.response.data);
      if (err.response && err.response.status === 408)
        throw new Errors.TimedoutError(err.message, err, err.response && err.response.data);
      throw new Errors.RequestError(err.message, err, JSON.stringify(err.response?.data), query);
    })
    .then((response) => {
      const { data } = response;

      if (data && data.errors && data.errors.length) {
        const message = `Response errors (${data.errors.length}): ${JSON.stringify(data.errors)}`;
        if (data.errors.find((e: TObject) => e.type === 'FORBIDDEN')) {
          debug('Error detect when performing request (type: FORBIDDEN)');
          throw new Errors.ForbiddenError(message, null, data, query);
        }
        if (data.errors.find((e: TObject) => e.type === 'INTERNAL')) {
          debug('Error detect when performing request (type: INTERNAL)');
          throw new Errors.InternalError(message, null, data, query);
        }
        if (data.errors.find((e: TObject) => e.type === 'NOT_FOUND')) {
          debug('Error detect when performing request (type: NOT_FOUND)');
          throw new Errors.NotFoundError(message, null, data, query);
        }
        if (data.errors.find((e: TObject) => e.type === 'MAX_NODE_LIMIT_EXCEEDED')) {
          debug('Error detect when performing request (type: MAX_NODE_LIMIT_EXCEEDED)');
          throw new Errors.MaxNodeLimitExceededError(message, null, data, query);
        }
        if (data.errors.find((e: TObject) => e.type === 'SERVICE_UNAVAILABLE')) {
          debug('Error detect when performing request (type: SERVICE_UNAVAILABLE)');
          throw new Errors.ServiceUnavailableError(message, null, data, query);
        }
        if (data.errors.find((e: TObject) => e.message === 'timedout')) {
          debug('Error detect when performing request (type: TIMEDOUT)');
          throw new Errors.TimedoutError(message, null, data, query);
        }
        if (data.errors.find((e: TObject) => e.message === 'loading')) {
          debug('Error detect when performing request (type: LOADING)');
          throw new Errors.LoadingError(message, null, data, query);
        }
        if (
          data.errors.find((e: TObject) => /^something.went.wrong.+/i.test(e.message as string))
        ) {
          debug('Error detect when performing request (type: SOMETHING_WENT_WRONG)');
          throw new Errors.SomethingWentWrongError(message, null, data, query);
        }
        debug('Error detect when performing request (type: UNKNOWN)');
        throw new Errors.RequestError(message, null, data, query);
      }

      return { ...response, data: normalize(compact(data)) };
    });
}
