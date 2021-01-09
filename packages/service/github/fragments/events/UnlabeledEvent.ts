/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class UnlabeledEvent extends Fragment {
  code = 'unlabeledEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on UnlabeledEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        label { name }
      }
    `;
  }
}

export default new UnlabeledEvent();
