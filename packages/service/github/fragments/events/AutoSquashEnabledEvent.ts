/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class AutoSquashEnabledEvent extends Fragment {
  code = 'autoSquashEnabledEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on AutoSquashEnabledEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        enabler { ...${SimplifiedActorFragment.code} }
      }
    `;
  }
}

export default new AutoSquashEnabledEvent();
