/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class CommentDeletedEvent extends Fragment {
  code = 'commentDeletedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on CommentDeletedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        deletedCommentAuthor  { ...${SimplifiedActorFragment.code} }
      }
    `;
  }
}

export default new CommentDeletedEvent();
