/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class AutoMergeEnabledEvent extends Fragment {
  code = 'autoMergeEnabledEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on AutoMergeEnabledEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        enabler { ...${SimplifiedActorFragment.code} }
      }
    `;
  }
}

export default new AutoMergeEnabledEvent();
