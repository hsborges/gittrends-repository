/*
 *  Author: Hudson S. Borges
 */
import Component from '../Component';
import Fragment from '../Fragment';
import ActorFragment from '../fragments/ActorFragment';

export default class ActorComponent extends Component {
  constructor(id: string) {
    super(id, 'actor');
  }

  get fragments(): Fragment[] {
    return [ActorFragment];
  }

  toString(): string {
    return `
      ${this.alias}:node(id: "${this.id}") {
        ...${ActorFragment.code}
      }
    `;
  }
}
