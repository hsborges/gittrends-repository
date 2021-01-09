/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';
import CommitFragment from './CommitFragment';

export class DeploymentFragment extends Fragment {
  code = 'deployment';

  get dependencies(): Fragment[] {
    return [CommitFragment, SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on Deployment {
        commit { ...${CommitFragment.code} }
        createdAt
        creator { ...${SimplifiedActorFragment.code} }
        databaseId
        environment
        id
        payload
        state
        statuses (last: 100) {
          nodes {
            creator { ...${SimplifiedActorFragment.code} }
            description
            environmentUrl
            id
            logUrl
            state
          }
        }
      }
    `;
  }
}

export default new DeploymentFragment();
