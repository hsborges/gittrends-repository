/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';
import PullRequestReviewCommentFragment from './PullRequestReviewCommentFragment';

export class PullRequestReviewThreadFragment extends Fragment {
  code = 'pullRequestReviewThread';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment, PullRequestReviewCommentFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on PullRequestReviewThread {
        diffSide
        isCollapsed
        isOutdated
        isResolved
        line
        originalLine
        originalStartLine
        path
        startDiffSide
        startLine
        resolvedBy { ...${SimplifiedActorFragment.code} }
        comments(first: 100) { nodes { ...${PullRequestReviewCommentFragment.code} } }
      }
    `;
  }
}

export default new PullRequestReviewThreadFragment();
