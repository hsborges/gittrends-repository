/*
 *  Author: Hudson S. Borges
 */
import Component from '../github/Component';
import { Cache } from './Cache';

export default abstract class AbstractHandler<T extends Component> {
  protected readonly _component: T;
  protected readonly cache?: Cache;

  protected constructor(component: T, opts?: { cache?: Cache }) {
    this._component = component;
    this.cache = opts?.cache;
  }

  get alias(): string | string[] {
    return this._component.alias;
  }

  abstract component(): Promise<T | Component[]>;
  abstract update(response: Record<string, unknown>): Promise<void>;
  abstract hasNextPage(): boolean;

  isDone(): boolean {
    return !this.hasNextPage();
  }
}
