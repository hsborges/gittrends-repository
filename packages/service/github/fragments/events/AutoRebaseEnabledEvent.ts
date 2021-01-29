/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class AutoRebaseEnabledEvent extends Fragment {
  code = 'autoRebaseEnabledEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on AutoRebaseEnabledEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        enabler { ...${SimplifiedActorFragment.code} }
      }
    `;
  }
}

export default new AutoRebaseEnabledEvent();
