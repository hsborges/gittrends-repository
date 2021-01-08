/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';
import CommitFragment from '../CommitFragment';

export class ReferencedEvent extends Fragment {
  code = 'referencedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment, CommitFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on ReferencedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        commit { ...${CommitFragment.code} }
        commitRepository { id }
        createdAt
        isCrossRepository
        isDirectReference
      }
    `;
  }
}

export default new ReferencedEvent();
