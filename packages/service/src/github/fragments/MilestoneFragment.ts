/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';

class MilestoneFragment extends Fragment {
  code = 'milestone';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on Milestone {
        creator { ...${SimplifiedActorFragment.code} }
        description
        dueOn
        id
        number
        state
        title
        url
      }
    `;
  }
}

export default new MilestoneFragment();
