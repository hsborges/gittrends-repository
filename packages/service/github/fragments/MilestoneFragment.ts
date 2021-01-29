/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';

export class MilestoneFragment extends Fragment {
  code = 'milestone';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on Milestone {
        type:__typename
        repository { id }
        creator { ...${SimplifiedActorFragment.code} }
        description
        dueOn
        id
        number
        progressPercentage
        state
        title
      }
    `;
  }
}

export default new MilestoneFragment();
