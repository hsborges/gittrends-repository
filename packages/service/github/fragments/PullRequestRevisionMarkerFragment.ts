/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import CommitFragment from './CommitFragment';

export class PullRequestRevisionMarkerFragment extends Fragment {
  code = 'pullRequestRevisionMarker';

  get dependencies(): Fragment[] {
    return [CommitFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on PullRequestRevisionMarker {
        createdAt
        lastSeenCommit { ...${CommitFragment.code} }
      }
    `;
  }
}

export default new PullRequestRevisionMarkerFragment();
