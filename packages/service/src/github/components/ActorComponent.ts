/*
 *  Author: Hudson S. Borges
 */
import Component from '../Component';
import Fragment from '../Fragment';
import ActorFragment from '../fragments/ActorFragment';

export default class ActorComponent extends Component {
  readonly id: string;

  constructor(id: string) {
    super('actor');
    this.id = id;
  }

  get fragments(): Fragment[] {
    return [ActorFragment];
  }

  toString(): string {
    return `
      ${this.aliases}:node(id: "${this.id}") {
        ...${ActorFragment.code}
      }
    `;
  }
}
