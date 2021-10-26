/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';
import CommitFragment from './CommitFragment';
import PullRequestReviewCommentFragment from './PullRequestReviewCommentFragment';
import ReactableFragment from './ReactableFragment';

export class PullRequestReviewFragment extends Fragment {
  code = 'pullRequestReview';

  get dependencies(): Fragment[] {
    return [
      SimplifiedActorFragment,
      CommitFragment,
      ReactableFragment,
      PullRequestReviewCommentFragment
    ];
  }

  toString(): string {
    return `
      fragment ${this.code} on PullRequestReview {
        type:__typename
        author { ...${SimplifiedActorFragment.code} }
        authorAssociation
        body
        comments(first: 100) { nodes { ...${PullRequestReviewCommentFragment.code} } }
        commit { ...${CommitFragment.code} }
        createdAt
        createdViaEmail
        databaseId
        editor { ...${SimplifiedActorFragment.code} }
        lastEditedAt
        publishedAt
        ...${ReactableFragment.code}
        state
        submittedAt
        updatedAt
        url
      }
    `;
  }
}

export default new PullRequestReviewFragment();
