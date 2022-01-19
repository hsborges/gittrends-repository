/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

import compact from '../helpers/compact';
import { RequestError } from '../helpers/errors';
import compress from '../helpers/gql-compress';
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
    return `
      query {
        ${this.components.map((component) => component.toString()).join('\n')}
      }
      ${this.fragments.map((fragment) => fragment.toString()).join('\n')}
    `;
  }

  async run(interceptor?: (args: string) => string): Promise<any> {
    return this.client
      .request({ query: compress(interceptor ? interceptor(this.toString()) : this.toString()) })
      .catch((err: Error & HttpClientResponse) =>
        Promise.reject(RequestError.create(err, { components: this.components }))
      )
      .then((response) => {
        const data = compact(normalize(response.data));

        if (data?.errors?.length) {
          throw RequestError.create(
            new Error(`Response errors (${data.errors.length}): ${JSON.stringify(data.errors)}`),
            { components: this.components, status: response.status, data: get(data, 'data', null) }
          );
        }

        return get(data, 'data', null);
      });
  }
}
