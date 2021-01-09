/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';
import DeploymentStatusFragment from '../DeploymentStatusFragment';

export class DeploymentEnvironmentChangedEvent extends Fragment {
  code = 'deploymentEnvironmentChangedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment, DeploymentStatusFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on DeploymentEnvironmentChangedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        deploymentStatus { ...${DeploymentStatusFragment.code} }
      }
    `;
  }
}

export default new DeploymentEnvironmentChangedEvent();
