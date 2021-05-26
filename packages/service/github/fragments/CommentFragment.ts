/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';

export class CommentFragment extends Fragment {
  code = 'comment';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on Comment {
        author { ...${SimplifiedActorFragment.code} }
        authorAssociation
        body
        createdAt
        createdViaEmail
        editor { ...${SimplifiedActorFragment.code} }
        id
        includesCreatedEdit
        lastEditedAt
        publishedAt
        updatedAt
      }
    `;
  }
}

export default new CommentFragment();
