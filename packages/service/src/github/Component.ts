/*
 *  Author: Hudson S. Borges
 */
import Fragment from './Fragment';

export default abstract class Component {
  alias: string;

  protected constructor(alias: string) {
    this.alias = alias;
  }

  protected argsToString(args: Record<string, unknown>): string {
    return Object.keys(args)
      .map((key) => {
        switch (typeof args[key]) {
          case 'number':
            return `${key}: ${args[key]}`;
          case 'string':
            return `${key}: "${args[key]}"`;
          default:
            return '';
        }
      })
      .filter((v) => v)
      .join(', ');
  }

  abstract get fragments(): Fragment[];
  abstract toString(): string;

  setAlias(alias: string): this {
    this.alias = alias;
    return this;
  }
}
