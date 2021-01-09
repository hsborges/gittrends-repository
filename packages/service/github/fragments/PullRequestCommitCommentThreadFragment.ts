/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import CommitFragment from './CommitFragment';
import CommitCommentFragment from './CommitCommentFragment';

export class PullRequestCommitCommentThreadFragment extends Fragment {
  code = 'pullRequestCommitCommentThread';

  get dependencies(): Fragment[] {
    return [CommitFragment, CommitCommentFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on PullRequestCommitCommentThread {
        comments(first: 100) { nodes { ...${CommitCommentFragment.code} } }
        commit { ...${CommitFragment.code} }
        path
        position
      }
    `;
  }
}

export default new PullRequestCommitCommentThreadFragment();
