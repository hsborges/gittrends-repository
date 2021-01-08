/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class MovedColumnsInProjectEvent extends Fragment {
  code = 'movedColumnsInProjectEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on MovedColumnsInProjectEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        previousProjectColumnName
        project { id }
        projectCard { id }
        projectColumnName
      }
    `;
  }
}

export default new MovedColumnsInProjectEvent();
