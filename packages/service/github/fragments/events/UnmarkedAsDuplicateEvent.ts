/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class UnmarkedAsDuplicateEvent extends Fragment {
  code = 'unmarkedAsDuplicateEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on UnmarkedAsDuplicateEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        duplicate { ... on Issue { id } }
        canonical { ... on Node { id } }
        isCrossRepository
      }
    `;
  }
}

export default new UnmarkedAsDuplicateEvent();
