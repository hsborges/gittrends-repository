import Component from '../github/Component';
import { Transaction } from 'knex';

export default abstract class AbstractHandler<T extends Component> {
  readonly component: T;

  protected constructor(component: T) {
    this.component = component;
  }

  abstract updateComponent(): Promise<void>;
  abstract updateDatabase(response: Record<string, unknown>, trx: Transaction): Promise<void>;

  abstract get hasNextPage(): boolean;

  get alias(): string {
    return this.component.alias;
  }

  get done(): boolean {
    return !this.hasNextPage;
  }
}
