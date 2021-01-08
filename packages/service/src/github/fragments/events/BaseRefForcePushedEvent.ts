/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';
import CommitFragment from '../CommitFragment';

export class BaseRefForcePushedEvent extends Fragment {
  code = 'baseRefForcePushedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment, CommitFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on BaseRefForcePushedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        afterCommit { ...${CommitFragment.code} }
        beforeCommit { ...${CommitFragment.code} }
        createdAt
        ref { name target { id } }
      }
    `;
  }
}

export default new BaseRefForcePushedEvent();
