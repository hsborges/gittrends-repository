/*
 *  Author: Hudson S. Borges
 */
import retry from 'async-retry';
import fetch from 'node-fetch';

export type HttpClientOpts = {
  protocol: string;
  host: string;
  port: number;
  timeout: number;
  retries: number;
  userAgent: string;
};

export type HttpClientResponse = {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string | string[]>;
};

export default class HttpClient {
  readonly protocol: string;
  readonly host: string;
  readonly port: number;
  readonly timeout: number;
  readonly retries: number;
  readonly userAgent: string;

  constructor(opts: HttpClientOpts) {
    this.protocol = opts.protocol;
    this.host = opts.host;
    this.port = opts.port;
    this.timeout = opts.timeout;
    this.retries = opts.retries;
    this.userAgent = opts.userAgent;
  }

  async request(data: string | Record<string, unknown>): Promise<HttpClientResponse> {
    return retry(
      async (bail) => {
        const controller = new globalThis.AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeout);

        return fetch(`${this.protocol}//${this.host}:${this.port}/graphql`, {
          method: 'POST',
          body: JSON.stringify(data),
          compress: true,
          headers: {
            'user-agent': this.userAgent,
            'accept-encoding': '*',
            'content-type': 'application/json',
            accept: [
              'application/vnd.github.starfox-preview+json',
              'application/vnd.github.hawkgirl-preview+json',
              'application/vnd.github.merge-info-preview+json'
            ].join(', ')
          },
          signal: controller.signal,
          timeout: this.timeout
        })
          .then(async (fetchResponse) => {
            const contentType =
              fetchResponse.headers.get('content-type')?.toLocaleLowerCase() || '';

            const response = {
              status: fetchResponse.status,
              statusText: fetchResponse.statusText,
              data: await (/application\/json/gi.test(contentType)
                ? fetchResponse.json()
                : fetchResponse.text()),
              headers: fetchResponse.headers.raw()
            };

            if (fetchResponse.ok) return response;

            const error = Object.assign(
              new Error(`Request failed with code ${fetchResponse.status}.`),
              response
            );

            if (/^[3-5]\d{2}$/.test(fetchResponse.status as any)) {
              bail(error);
              return response;
            }

            throw error;
          })
          .finally(() => clearTimeout(timeout));
      },
      { retries: this.retries, minTimeout: 100, maxTimeout: 500, randomize: true }
    );
  }
}
