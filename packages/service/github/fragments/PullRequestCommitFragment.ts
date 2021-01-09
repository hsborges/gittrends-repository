/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import CommitFragment from './CommitFragment';

export class PullRequestCommitFragment extends Fragment {
  code = 'pullRequestCommit';

  get dependencies(): Fragment[] {
    return [CommitFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on PullRequestCommit {
        commit { ...${CommitFragment.code} }
      }
    `;
  }
}

export default new PullRequestCommitFragment();
