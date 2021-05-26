/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';
import DeploymentFragment from '../DeploymentFragment';

export class DeployedEvent extends Fragment {
  code = 'deployedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment, DeploymentFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on DeployedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        databaseId
        deployment { ...${DeploymentFragment.code} }
        ref { name target { id } }
      }
    `;
  }
}

export default new DeployedEvent();
