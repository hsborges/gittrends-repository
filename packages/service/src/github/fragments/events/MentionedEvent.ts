/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class MentionedEvent extends Fragment {
  code = 'mentionedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on MentionedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
      }
    `;
  }
}

export default new MentionedEvent();
