/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';
import CommitFragment from '../CommitFragment';

export class ClosedEvent extends Fragment {
  code = 'closedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment, CommitFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on ClosedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        closer {
          type:__typename
          ... on Node { id }
          ... on Commit { ...${CommitFragment.code} }
        }
        createdAt
      }
    `;
  }
}

export default new ClosedEvent();
