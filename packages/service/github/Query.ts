/*
 *  Author: Hudson S. Borges
 */
import { get } from 'lodash';

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
      query: interceptor ? interceptor(this.toString()) : this.toString()
    }).then((response) => get(response, 'data.data', null));
  }
}
