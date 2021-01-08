/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';
import PullRequestCommitFragment from '../PullRequestCommitFragment';

export class ReviewDismissedEvent extends Fragment {
  code = 'reviewDismissedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment, PullRequestCommitFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on ReviewDismissedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        databaseId
        dismissalMessage
        previousReviewState
        pullRequestCommit { ...${PullRequestCommitFragment.code} }
        review { id }
        url
      }
    `;
  }
}

export default new ReviewDismissedEvent();
