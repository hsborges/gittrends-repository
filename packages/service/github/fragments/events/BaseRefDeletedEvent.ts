/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class BaseRefDeletedEvent extends Fragment {
  code = 'baseRefDeletedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on BaseRefDeletedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        baseRefName
        createdAt
      }
    `;
  }
}

export default new BaseRefDeletedEvent();
