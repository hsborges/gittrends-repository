/*
 *  Author: Hudson S. Borges
 */
import retry from 'retry';
import UserAgent from 'user-agents';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import compact from '../helpers/compact';
import * as Errors from '../helpers/errors';

const PROTOCOL = process.env.GITTRENDS_PROXY_PROTOCOL || 'http';
const HOST = process.env.GITTRENDS_PROXY_HOST || 'localhost';
const PORT = process.env.GITTRENDS_PROXY_PORT || 8888;
const TIMEOUT = process.env.GITTRENDS_PROXY_TIMEOUT || undefined;
const RETRIES = process.env.GITTRENDS_PROXY_RETRIES || 5;
const USER_AGENT = process.env.GITTRENDS_PROXY_USER_AGENT || new UserAgent().random().toString();

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

type IObject = Record<string, unknown>;

async function retriableRequest(data: IObject): Promise<AxiosResponse> {
  return new Promise((resolve, reject) => {
    const operation = retry.operation({
      retries: RETRIES,
      randomize: true,
      minTimeout: 500,
      maxTimeout: 2000
    });

    operation.attempt(() => {
      requestClient({ method: 'post', data: data })
        .then(resolve)
        .catch((err) => {
          if (err.code === 'ECONNABORTED' && operation.retry(err)) return;
          if (err.code === 'ECONNREFUSED' && operation.retry(err)) return;
          if (err.response && err.response.status === 408 && operation.retry(err)) return;
          if (err.response && /500/g.test(err.response.status) && operation.retry(err)) return;
          return reject(operation.mainError() || err);
        });
    });
  });
}

/* exports */
export default async function (query: IObject): Promise<AxiosResponse> {
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
        if (data.errors.find((e: IObject) => e.type === 'FORBIDDEN'))
          throw new Errors.ForbiddenError(message, null, data, query);
        if (data.errors.find((e: IObject) => e.type === 'INTERNAL'))
          throw new Errors.InternalError(message, null, data, query);
        if (data.errors.find((e: IObject) => e.type === 'NOT_FOUND'))
          throw new Errors.NotFoundError(message, null, data, query);
        if (data.errors.find((e: IObject) => e.type === 'MAX_NODE_LIMIT_EXCEEDED'))
          throw new Errors.MaxNodeLimitExceededError(message, null, data, query);
        if (data.errors.find((e: IObject) => e.type === 'SERVICE_UNAVAILABLE'))
          throw new Errors.ServiceUnavailableError(message, null, data, query);
        if (data.errors.find((e: IObject) => e.message === 'timedout'))
          throw new Errors.TimedoutError(message, null, data, query);
        if (data.errors.find((e: IObject) => e.message === 'loading'))
          throw new Errors.LoadingError(message, null, data, query);
        if (data.errors.find((e: IObject) => /^something.went.wrong.+/i.test(e.message as string)))
          throw new Errors.SomethingWentWrongError(message, null, data, query);
        throw new Errors.RequestError(message, null, data, query);
      }

      return { ...response, data: compact(response.data) };
    });
}