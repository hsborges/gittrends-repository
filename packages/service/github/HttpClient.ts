/*
 *  Author: Hudson S. Borges
 */
import pRetry from 'promise-retry';
import UserAgent from 'user-agents';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import compact from '../helpers/compact';
import * as Errors from '../helpers/errors';

const PROTOCOL = process.env.GITTRENDS_PROXY_PROTOCOL ?? 'http';
const HOST = process.env.GITTRENDS_PROXY_HOST ?? 'localhost';
const PORT = parseInt(process.env.GITTRENDS_PROXY_PORT ?? '3000', 10);
const TIMEOUT = parseInt(process.env.GITTRENDS_PROXY_TIMEOUT ?? '0', 10) || undefined;
const RETRIES = parseInt(process.env.GITTRENDS_PROXY_RETRIES ?? '5', 10);
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

async function retriableRequest(data: TObject): Promise<AxiosResponse> {
  return pRetry(
    (retry) =>
      requestClient({ method: 'post', data: data }).catch((err) => {
        if (err.code === 'ECONNABORTED' || err.code === 'ECONNREFUSED') return retry(err);
        if (err.response && /500|408|403/g.test(err.response.status)) return retry(err);
        throw err;
      }),
    { retries: RETRIES, minTimeout: 500, maxTimeout: 2000, randomize: true }
  );
}

/* exports */
export default async function (query: TObject): Promise<AxiosResponse> {
  return retriableRequest(query)
    .catch((err) => {
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
        if (data.errors.find((e: TObject) => e.type === 'FORBIDDEN'))
          throw new Errors.ForbiddenError(message, null, data, query);
        if (data.errors.find((e: TObject) => e.type === 'INTERNAL'))
          throw new Errors.InternalError(message, null, data, query);
        if (data.errors.find((e: TObject) => e.type === 'NOT_FOUND'))
          throw new Errors.NotFoundError(message, null, data, query);
        if (data.errors.find((e: TObject) => e.type === 'MAX_NODE_LIMIT_EXCEEDED'))
          throw new Errors.MaxNodeLimitExceededError(message, null, data, query);
        if (data.errors.find((e: TObject) => e.type === 'SERVICE_UNAVAILABLE'))
          throw new Errors.ServiceUnavailableError(message, null, data, query);
        if (data.errors.find((e: TObject) => e.message === 'timedout'))
          throw new Errors.TimedoutError(message, null, data, query);
        if (data.errors.find((e: TObject) => e.message === 'loading'))
          throw new Errors.LoadingError(message, null, data, query);
        if (data.errors.find((e: TObject) => /^something.went.wrong.+/i.test(e.message as string)))
          throw new Errors.SomethingWentWrongError(message, null, data, query);
        throw new Errors.RequestError(message, null, data, query);
      }

      return { ...response, data: compact(response.data) };
    });
}
