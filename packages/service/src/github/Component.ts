/*
 *  Author: Hudson S. Borges
 */
import Fragment from './Fragment';

export default abstract class Component {
  aliases: string[] | string;

  protected constructor(alias: string) {
    this.aliases = alias;
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

  alias(alias: string[] | string): Component {
    this.aliases = alias;
    return this;
  }
}
