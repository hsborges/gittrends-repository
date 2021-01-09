/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class AutomaticBaseChangeFailedEvent extends Fragment {
  code = 'automaticBaseChangeFailedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on AutomaticBaseChangeFailedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        newBase
        oldBase
      }
    `;
  }
}

export default new AutomaticBaseChangeFailedEvent();
