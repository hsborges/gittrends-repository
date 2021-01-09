/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class RemovedFromProjectEvent extends Fragment {
  code = 'removedFromProjectEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on RemovedFromProjectEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        project { id }
        projectColumnName
      }
    `;
  }
}

export default new RemovedFromProjectEvent();
