/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class HeadRefDeletedEvent extends Fragment {
  code = 'headRefDeletedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on HeadRefDeletedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        headRef { name target { id } }
        headRefName
      }
    `;
  }
}

export default new HeadRefDeletedEvent();
