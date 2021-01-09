/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class UnlockedEvent extends Fragment {
  code = 'unlockedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on UnlockedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
      }
    `;
  }
}

export default new UnlockedEvent();
