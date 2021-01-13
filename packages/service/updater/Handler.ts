/*
 *  Author: Hudson S. Borges
 */
import Component from '../github/Component';
import { Transaction } from 'knex';

export default abstract class AbstractHandler<T extends Component> {
  protected readonly _component: T;

  protected constructor(component: T) {
    this._component = component;
  }

  get alias(): string | string[] {
    return this._component.alias;
  }

  abstract component(): Promise<T | Component[]>;
  abstract update(response: Record<string, unknown>, trx: Transaction): Promise<void>;
  abstract hasNextPage(): boolean;

  isDone(): boolean {
    return !this.hasNextPage();
  }
}
