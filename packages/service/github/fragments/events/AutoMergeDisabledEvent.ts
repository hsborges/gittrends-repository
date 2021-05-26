/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class AutoMergeDisabledEvent extends Fragment {
  code = 'autoMergeDisabledEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on AutoMergeDisabledEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        disabler { ...${SimplifiedActorFragment.code} }
        reason
        reasonCode
      }
    `;
  }
}

export default new AutoMergeDisabledEvent();
