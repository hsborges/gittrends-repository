/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';
import parser, { Response } from './ResponseParser';
import client from './HttpClient';
import Component from './Component';
import Fragment from './Fragment';

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
  readonly fragments: Set<Fragment> = new Set();
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
      fragments.forEach((fragment) => this.fragments.add(fragment));
      fragments.forEach((fragment) => pushFragment(fragment.dependencies));
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
      ${this.components.map((component) => component.toString())}
    }
    ${[...this.fragments].map((fragment) => fragment.toString())}
    `
      .replace(/\s+/g, ' ')
      .trim();
  }

  async run(interceptor?: (args: string) => string): Promise<Response> {
    const query = interceptor ? interceptor(this.toString()) : this.toString();
    return client({ query })
      .then((response) => parser(get(response, 'data.data', null)))
      .catch((err) => {
        if (err.response) err.response = parser(get(err, 'response.data', null));
        throw err;
      });
  }

  async then(callback: (response: Response) => PromiseLike<void>): Promise<void> {
    return this.run().then(callback);
  }
}
