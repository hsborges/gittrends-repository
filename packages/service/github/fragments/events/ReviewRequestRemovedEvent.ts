/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class ReviewRequestRemovedEvent extends Fragment {
  code = 'reviewRequestRemovedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on ReviewRequestRemovedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        requestedReviewer { ...${SimplifiedActorFragment.code} }
      }
    `;
  }
}

export default new ReviewRequestRemovedEvent();
