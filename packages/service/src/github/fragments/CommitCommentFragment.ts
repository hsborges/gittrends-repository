/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import ReactableFragment from './ReactableFragment';
import CommentFragment from './CommentFragment';
import CommitFragment from './CommitFragment';

export class CommitCommentFragment extends Fragment {
  code = 'commitComment';

  get dependencies(): Fragment[] {
    return [ReactableFragment, CommentFragment, CommitFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on CommitComment {
        type:__typename
        id
        ... on Comment { ...${CommentFragment.code} }
        commit { ...${CommitFragment.code} }
        databaseId
        path
        position
        ...${ReactableFragment.code}
      }
    `;
  }
}

export default new CommitCommentFragment();
