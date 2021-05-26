/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';
import CommitFragment from '../CommitFragment';

export class MergedEvent extends Fragment {
  code = 'mergedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment, CommitFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on MergedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        commit { ...${CommitFragment.code} }
        createdAt
        mergeRef { name target { id } }
        mergeRefName
        url
      }
    `;
  }
}

export default new MergedEvent();
