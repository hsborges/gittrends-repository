/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class DemilestonedEvent extends Fragment {
  code = 'demilestonedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on DemilestonedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        milestoneTitle
      }
    `;
  }
}

export default new DemilestonedEvent();
