/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class ReadyForReviewEvent extends Fragment {
  code = 'readyForReviewEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on ReadyForReviewEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
      }
    `;
  }
}

export default new ReadyForReviewEvent();
