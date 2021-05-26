/*
 *  Author: Hudson S. Borges
 */
import { ClientSession } from 'mongodb';
import Component from '../github/Component';

export default abstract class AbstractHandler<T extends Component> {
  protected readonly _component: T;

  protected constructor(component: T) {
    this._component = component;
  }

  get alias(): string | string[] {
    return this._component.alias;
  }

  abstract component(): Promise<T | Component[]>;
  abstract update(response: Record<string, unknown>, session?: ClientSession): Promise<void>;
  abstract hasNextPage(): boolean;

  isDone(): boolean {
    return !this.hasNextPage();
  }
}
