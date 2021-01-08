/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class LabeledEvent extends Fragment {
  code = 'labeledEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on LabeledEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        label { name }
      }
    `;
  }
}

export default new LabeledEvent();
