/*
 *  Author: Hudson S. Borges
 */
import UserAgent from 'user-agents';
import pRetry from 'p-retry';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

import compact from '../helpers/compact';
import normalize from '../helpers/normalize';
import * as Errors from '../helpers/errors';

const PROTOCOL = process.env.GITTRENDS_PROXY_PROTOCOL ?? 'http';
const HOST = process.env.GITTRENDS_PROXY_HOST ?? 'localhost';
const PORT = parseInt(process.env.GITTRENDS_PROXY_PORT ?? '3000', 10);
const TIMEOUT = parseInt(process.env.GITTRENDS_PROXY_TIMEOUT ?? '15000', 10);
const RETRIES = parseInt(process.env.GITTRENDS_PROXY_RETRIES ?? '0', 5);
const USER_AGENT = process.env.GITTRENDS_PROXY_USER_AGENT ?? new UserAgent().random().toString();

const requestClient: AxiosInstance = axios.create({
  baseURL: `${PROTOCOL}://${HOST}:${PORT}/graphql`,
  responseType: 'json',
  headers: {
    'user-agent': USER_AGENT,
    'accept-encoding': 'gzip',
    accept: [
      'application/vnd.github.starfox-preview+json',
      'application/vnd.github.hawkgirl-preview+json',
      'application/vnd.github.merge-info-preview+json'
    ].join(', '),
    timeout: TIMEOUT
  }
});

/* exports */
export default async function (query: TObject): Promise<AxiosResponse> {
  return pRetry(
    () => {
      const source = axios.CancelToken.source();

      const timeout = setTimeout(() => {
        source.cancel(
          `Cancelled request, took longer than ${(TIMEOUT * 2) / 1000}s to get complete response.`
        );
      }, TIMEOUT * 2);

      return requestClient({ method: 'post', data: query, cancelToken: source.token })
        .catch((err) => {
          switch (err.response?.status) {
            case 408:
              throw new Errors.TimedoutError(err.message, err, err.response?.data);
            case 500:
              throw new Errors.InternalServerError(err.message, err, err.response?.data);
            case 502:
              throw new Errors.BadGatewayError(err.message, err, err.response?.data);
            default:
              throw new Errors.RequestError(err.message, err, err.response?.data, query);
          }
        })
        .finally(() => clearTimeout(timeout));
    },
    { retries: RETRIES, minTimeout: 100, maxTimeout: 500, randomize: true }
  ).then((response) => {
    const data = normalize(compact(response.data));

    if (data?.errors?.length) {
      const message = `Response errors (${data.errors.length}): ${JSON.stringify(data.errors)}`;
      if (data.errors.find((e: TObject) => e.type === 'FORBIDDEN')) {
        throw new Errors.ForbiddenError(message, null, data, query);
      }
      if (data.errors.find((e: TObject) => e.type === 'INTERNAL')) {
        throw new Errors.InternalError(message, null, data, query);
      }
      if (data.errors.find((e: TObject) => e.type === 'NOT_FOUND')) {
        throw new Errors.NotFoundError(message, null, data, query);
      }
      if (data.errors.find((e: TObject) => e.type === 'MAX_NODE_LIMIT_EXCEEDED')) {
        throw new Errors.MaxNodeLimitExceededError(message, null, data, query);
      }
      if (data.errors.find((e: TObject) => e.type === 'SERVICE_UNAVAILABLE')) {
        throw new Errors.ServiceUnavailableError(message, null, data, query);
      }
      if (data.errors.find((e: TObject) => e.message === 'timedout')) {
        throw new Errors.TimedoutError(message, null, data, query);
      }
      if (data.errors.find((e: TObject) => e.message === 'loading')) {
        throw new Errors.LoadingError(message, null, data, query);
      }
      if (data.errors.find((e: TObject) => /^something.went.wrong.+/i.test(e.message as string))) {
        throw new Errors.SomethingWentWrongError(message, null, data, query);
      }
      throw new Errors.RequestError(message, null, data, query);
    }

    return { ...response, data };
  });
}
