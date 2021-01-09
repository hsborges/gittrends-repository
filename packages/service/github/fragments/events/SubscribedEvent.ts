/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class SubscribedEvent extends Fragment {
  code = 'subscribedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on SubscribedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
      }
    `;
  }
}

export default new SubscribedEvent();
