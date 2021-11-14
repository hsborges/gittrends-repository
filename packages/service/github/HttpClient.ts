/*
 *  Author: Hudson S. Borges
 */
import axios, { AxiosResponse } from 'axios';
import pRetry from 'promise-retry';
import UserAgent from 'user-agents';

export const PROTOCOL = process.env.GT_PROXY_PROTOCOL ?? 'http';
export const HOST = process.env.GT_PROXY_HOST ?? 'localhost';
export const PORT = parseInt(process.env.GT_PROXY_PORT ?? '3000', 10);
export const TIMEOUT = parseInt(process.env.GT_PROXY_TIMEOUT ?? '15000', 10);
export const RETRIES = parseInt(process.env.GT_PROXY_RETRIES ?? '0', 5);
export const USER_AGENT = process.env.GT_PROXY_USER_AGENT ?? new UserAgent().random().toString();
export const BASE_URL = `${PROTOCOL}://${HOST}:${PORT}`;

/* exports */
export default async function (data: string | Record<string, unknown>): Promise<AxiosResponse> {
  return pRetry(
    (retry) => {
      const source = axios.CancelToken.source();

      const timeout = setTimeout(
        () =>
          source?.cancel(
            `Cancelled request. Took longer than ${TIMEOUT}ms to get complete response.`
          ),
        TIMEOUT
      );

      return axios
        .post('/graphql', data, {
          baseURL: BASE_URL,
          responseType: 'json',
          headers: {
            'user-agent': USER_AGENT,
            'Accept-Encoding': '*',
            accept: [
              'application/vnd.github.starfox-preview+json',
              'application/vnd.github.hawkgirl-preview+json',
              'application/vnd.github.merge-info-preview+json'
            ].join(', ')
          },
          timeout: TIMEOUT,
          cancelToken: source?.token
        })
        .catch((err) => {
          if (!err.response?.status || /^6\d{2}$/.test(err.response?.status)) retry(err);
          throw err;
        })
        .finally(() => clearTimeout(timeout));
    },
    { retries: RETRIES, minTimeout: 100, maxTimeout: 500, randomize: true }
  );
}
