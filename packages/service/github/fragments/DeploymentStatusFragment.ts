/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';
import DeploymentFragment from './DeploymentFragment';

export class DeploymentStatusFragment extends Fragment {
  code = 'deploymentStatus';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment, DeploymentFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on DeploymentStatus {
        createdAt
        creator { ...${SimplifiedActorFragment.code} }
        deployment { ...${DeploymentFragment.code} }
        description
        logUrl
        state
        updatedAt
      }
    `;
  }
}

export default new DeploymentStatusFragment();
