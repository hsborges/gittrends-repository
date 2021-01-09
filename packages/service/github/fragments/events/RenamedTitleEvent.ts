/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class RenamedTitleEvent extends Fragment {
  code = 'renamedTitleEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on RenamedTitleEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        currentTitle
        previousTitle
      }
    `;
  }
}

export default new RenamedTitleEvent();
