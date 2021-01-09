/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class AssignedEvent extends Fragment {
  code = 'assignedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on AssignedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        assignee { ...${SimplifiedActorFragment.code} }
        createdAt
      }
    `;
  }
}

export default new AssignedEvent();
