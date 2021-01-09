import Component from '../github/Component';
import { Transaction } from 'knex';

export default abstract class AbstractHandler<T extends Component> {
  protected readonly _component: T;

  protected constructor(component: T) {
    this._component = component;
  }

  abstract component(): Promise<T | Component[]>;
  abstract update(response: Record<string, unknown>, trx: Transaction): Promise<void>;

  abstract get hasNextPage(): boolean;

  get alias(): string | string[] {
    return this._component.alias;
  }

  get done(): boolean {
    return !this.hasNextPage;
  }
}
