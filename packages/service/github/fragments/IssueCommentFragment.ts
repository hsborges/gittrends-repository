/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import ReactableFragment from './ReactableFragment';
import CommentFragment from './CommentFragment';

export class IssueCommentFragment extends Fragment {
  code = 'issueComment';

  get dependencies(): Fragment[] {
    return [ReactableFragment, CommentFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on IssueComment {
        ...${CommentFragment.code}
        lastEditedAt
        publishedAt
        isMinimized
        minimizedReason
        ...${ReactableFragment.code}
      }
    `;
  }
}

export default new IssueCommentFragment();
