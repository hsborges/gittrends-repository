/*
 *  Author: Hudson S. Borges
 */
import compress from 'graphql-query-compress';
import { get } from 'lodash';

import compact from '../helpers/compact';
import * as Errors from '../helpers/errors';
import normalize from '../helpers/normalize';
import Component from './Component';
import Fragment from './Fragment';
import HttpClient, { HttpClientResponse } from './HttpClient';

export default class Query {
  readonly components: Component[] = [];
  readonly fragments: Fragment[] = [];

  private readonly client: HttpClient;

  private constructor(httpClient: HttpClient) {
    this.client = httpClient;
  }

  static create(httpClient: HttpClient): Query {
    return new Query(httpClient);
  }

  compose(...components: Component[]): Query {
    this.components.push(...components);

    const pushFragment = (fragments: Fragment[]) => {
      fragments.forEach((fragment) => {
        if (this.fragments.indexOf(fragment) < 0) {
          this.fragments.push(fragment);
          pushFragment(fragment.dependencies);
        }
      });
    };

    components.forEach((component) => pushFragment(component.fragments));

    return this;
  }

  toString(): string {
    return compress(`
      query {
        ${this.components.map((component) => component.toString()).join('\n')}
      }
      ${this.fragments.map((fragment) => fragment.toString()).join('\n')}
    `);
  }

  async run(interceptor?: (args: string) => string): Promise<any> {
    return this.client
      .request({ query: interceptor ? interceptor(this.toString()) : this.toString() })
      .catch((err: Error & HttpClientResponse) => {
        switch (err.status) {
          case 408:
            throw new Errors.TimedoutError(err, { components: this.components });
          case 500:
            throw new Errors.InternalServerError(err, { components: this.components });
          case 502:
            throw new Errors.BadGatewayError(err, { components: this.components });
          default:
            throw new Errors.RequestError(err, { components: this.components });
        }
      })
      .then((response) => {
        const data = compact(normalize(response.data));

        if (data?.errors?.length) {
          const error = new Error(
            `Response errors (${data.errors.length}): ${JSON.stringify(data.errors)}`
          );

          const opts = { components: this.components, status: 200, data: get(data, 'data', null) };

          if (data.errors.find((e: TObject) => e.type === 'FORBIDDEN'))
            throw new Errors.ForbiddenError(error, opts);

          if (data.errors.find((e: TObject) => e.type === 'INTERNAL'))
            throw new Errors.InternalError(error, opts);

          if (data.errors.find((e: TObject) => e.type === 'NOT_FOUND'))
            throw new Errors.NotFoundError(error, opts);

          if (data.errors.find((e: TObject) => e.type === 'MAX_NODE_LIMIT_EXCEEDED'))
            throw new Errors.MaxNodeLimitExceededError(error, opts);

          if (data.errors.find((e: TObject) => e.type === 'SERVICE_UNAVAILABLE'))
            throw new Errors.ServiceUnavailableError(error, opts);

          if (data.errors.find((e: TObject) => e.message === 'timedout'))
            throw new Errors.TimedoutError(error, opts);

          if (data.errors.find((e: TObject) => e.message === 'loading'))
            throw new Errors.LoadingError(error, opts);

          if (
            data.errors.find((e: TObject) => /^something.went.wrong.+/i.test(e.message as string))
          )
            throw new Errors.SomethingWentWrongError(error, opts);

          throw new Errors.RequestError(error, opts);
        }

        return get(data, 'data', null);
      });
  }
}
