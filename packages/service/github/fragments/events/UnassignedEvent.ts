/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class UnassignedEvent extends Fragment {
  code = 'unassignedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on UnassignedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        assignee { ...${SimplifiedActorFragment.code} }
        createdAt
      }
    `;
  }
}

export default new UnassignedEvent();
