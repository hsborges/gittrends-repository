/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class UserBlockedEvent extends Fragment {
  code = 'userBlockedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on UserBlockedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        blockDuration
        createdAt
        subject { ...${SimplifiedActorFragment.code} }
      }
    `;
  }
}

export default new UserBlockedEvent();
