/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class CrossReferencedEvent extends Fragment {
  code = 'crossReferencedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on CrossReferencedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        isCrossRepository
        referencedAt
        source { type:__typename ... on Node { id } }
        target { type:__typename ... on Node { id } }
        url
        willCloseTarget
      }
    `;
  }
}

export default new CrossReferencedEvent();
