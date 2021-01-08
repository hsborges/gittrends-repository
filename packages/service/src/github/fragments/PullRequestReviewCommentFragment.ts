/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import CommentFragment from './CommentFragment';
import CommitFragment from './CommitFragment';
import ReactableFragment from './ReactableFragment';

export class PullRequestReviewCommentFragment extends Fragment {
  code = 'pullRequestReviewComment';

  get dependencies(): Fragment[] {
    return [CommitFragment, CommentFragment, ReactableFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on PullRequestReviewComment {
        id
        type:__typename
        ... on Comment { ...${CommentFragment.code} }
        commit { ...${CommitFragment.code} }
        databaseId
        diffHunk
        draftedAt
        isMinimized
        minimizedReason
        originalCommit { ...${CommitFragment.code} }
        originalPosition
        outdated
        path
        position
        ...${ReactableFragment.code}
        replyTo { id }
        state
        url
      }
    `;
  }
}

export default new PullRequestReviewCommentFragment();
