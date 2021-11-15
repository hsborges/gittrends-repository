/*
 *  Author: Hudson S. Borges
 */
import { AxiosError } from 'axios';
import compress from 'graphql-query-compress';
import { get } from 'lodash';

import compact from '../helpers/compact';
import * as Errors from '../helpers/errors';
import normalize from '../helpers/normalize';
import Component from './Component';
import Fragment from './Fragment';
import client from './HttpClient';

function getGraphQLType(key: unknown) {
  switch (typeof key) {
    case 'number':
      return 'Int';
    case 'boolean':
      return 'Boolean';
    default:
      return 'String';
  }
}

export default class Query {
  readonly components: Component[] = [];
  readonly fragments: Fragment[] = [];
  readonly args: Record<string, unknown>;

  private constructor(args?: Record<string, unknown>) {
    this.args = Object.assign({}, args);
  }

  static create(args?: Record<string, unknown>): Query {
    return new Query(args);
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
    const keys = Object.keys(this.args);

    const _args = !keys.length
      ? ''
      : `(${keys
          .map(
            (k) =>
              `$${k}:${getGraphQLType(this.args[k])} ${this.args[k] ? `= ${this.args[k]}` : ''}`
          )
          .join(', ')
          .replace(/\s+/g, ' ')
          .replace(/\s,/g, ',')})`;

    return `
    query${_args} {
      ${this.components.map((component) => component.toString()).join('\n')}
    }
    ${this.fragments.map((fragment) => fragment.toString()).join('\n')}
    `
      .replace(/\s+/g, ' ')
      .trim();
  }

  async run(interceptor?: (args: string) => string): Promise<any> {
    return client({
      query: compress(interceptor ? interceptor(this.toString()) : this.toString())
    })
      .catch((err: AxiosError) => {
        const opts = { components: this.components };
        switch (err.response?.status) {
          case 408:
            throw new Errors.TimedoutError(err, opts);
          case 500:
            throw new Errors.InternalServerError(err, opts);
          case 502:
            throw new Errors.BadGatewayError(err, opts);
          default:
            throw new Errors.RequestError(err, opts);
        }
      })
      .then((response) => {
        const data = normalize(compact(response.data));

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

        return { ...response, data };
      })
      .then((response) => get(response, 'data.data', null));
  }
}
