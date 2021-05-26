/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class BaseRefChangedEvent extends Fragment {
  code = 'baseRefChangedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on BaseRefChangedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        currentRefName
        previousRefName
      }
    `;
  }
}

export default new BaseRefChangedEvent();
