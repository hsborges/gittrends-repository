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
    return Object.entries(args)
      .filter(([, value]) => value)
      .map(([key, value]) => {
        if (typeof value === 'number') return `${key}: ${value}`;
        if (typeof value === 'string') return `${key}: "${value}"`;
        throw new Error(`Unknown key/value type (${key}:${args[key]})!`);
      })
      .join(', ');
  }

  abstract get fragments(): Fragment[];
  abstract toString(): string;

  setAlias(alias: string): this {
    this.alias = alias;
    return this;
  }
}
