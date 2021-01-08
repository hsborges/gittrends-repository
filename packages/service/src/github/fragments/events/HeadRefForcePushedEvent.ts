/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';
import CommitFragment from '../CommitFragment';

export class HeadRefForcePushedEvent extends Fragment {
  code = 'headRefForcePushedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment, CommitFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on HeadRefForcePushedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        afterCommit { ...${CommitFragment.code} }
        beforeCommit { ...${CommitFragment.code} }
        createdAt
        ref { name target { id } }
      }
    `;
  }
}

export default new HeadRefForcePushedEvent();
