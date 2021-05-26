/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class AutomaticBaseChangeSucceededEvent extends Fragment {
  code = 'automaticBaseChangeSucceededEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on AutomaticBaseChangeSucceededEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        newBase
        oldBase
      }
    `;
  }
}

export default new AutomaticBaseChangeSucceededEvent();
