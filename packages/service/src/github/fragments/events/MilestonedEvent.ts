/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class MilestonedEvent extends Fragment {
  code = 'milestonedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on MilestonedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        milestoneTitle
      }
    `;
  }
}

export default new MilestonedEvent();
