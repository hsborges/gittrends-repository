/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class LockedEvent extends Fragment {
  code = 'lockedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on LockedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        lockReason
      }
    `;
  }
}

export default new LockedEvent();
