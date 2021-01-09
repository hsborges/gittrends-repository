/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class HeadRefRestoredEvent extends Fragment {
  code = 'headRefRestoredEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on HeadRefRestoredEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
      }
    `;
  }
}

export default new HeadRefRestoredEvent();
