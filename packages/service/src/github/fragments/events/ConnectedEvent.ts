/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class ConnectedEvent extends Fragment {
  code = 'connectedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on ConnectedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        isCrossRepository
        source {
          ... on Issue { id type:__typename }
          ... on PullRequest { id type:__typename }
        }
        subject {
          ... on Issue { id type:__typename }
          ... on PullRequest { id type:__typename }
        }
      }
    `;
  }
}

export default new ConnectedEvent();
