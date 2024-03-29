/*
 *  Author: Hudson S. Borges
 */
import { isEmpty, isNil, mapValues, negate, omit, omitBy } from 'lodash';

import Fragment from './Fragment';

type TIncludes = Record<
  string,
  ({ textFragment?: string; first?: number; after?: string } & Record<string, any>) | false
>;

export default abstract class Component {
  readonly includes: TIncludes;

  readonly id?: string | null;
  alias: string;

  protected constructor(id: string | null | undefined, alias: string) {
    this.id = id;
    this.alias = alias;
    this.includes = {};
  }

  protected argsToString(args: Record<string, unknown>): string {
    return Object.entries(args)
      .filter(([, value]) => negate(isNil)(value))
      .map(([key, value]) => {
        if (typeof value === 'number') return `${key}: ${value}`;
        if (typeof value === 'string') return `${key}: "${value}"`;
        throw new Error(`Unknown key/value type (${key}:${args[key]})!`);
      })
      .join(', ');
  }

  abstract get fragments(): Fragment[];
  abstract toString(): string;

  toJSON(): { component: string; id?: string | null } & Record<string, any> {
    return {
      component: this.constructor.name,
      id: this.id,
      ...omitBy(
        mapValues(this.includes, (value) => {
          if (!value) return null;
          const nValue = omit(value, ['textFragment']);
          return isEmpty(nValue) ? true : nValue;
        }),
        isNil
      )
    };
  }

  setAlias(alias: string): this {
    this.alias = alias;
    return this;
  }
}
