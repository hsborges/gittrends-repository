/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class MarkedAsDuplicateEvent extends Fragment {
  code = 'markedAsDuplicateEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on MarkedAsDuplicateEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        duplicate {
          ... on Issue { id }
          ... on PullRequest { id }
        }
        canonical {
          ... on Issue { id }
          ... on PullRequest { id }
        }
        isCrossRepository
      }
    `;
  }
}

export default new MarkedAsDuplicateEvent();
