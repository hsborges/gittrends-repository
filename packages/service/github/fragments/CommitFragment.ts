/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';

export class CommitFragment extends Fragment {
  code = 'commit';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
    fragment ${this.code} on Commit {
      type:__typename
      additions
      author { date email name user { ...${SimplifiedActorFragment.code} } }
      authoredByCommitter
      authoredDate
      changedFiles
      comments { totalCount }
      committedDate
      committedViaWeb
      committer { date email name user { ...${SimplifiedActorFragment.code} } }
      deletions
      id
      message
      oid
      pushedDate
      repository { id }
      signature {
        email isValid signer { ...${SimplifiedActorFragment.code} } state wasSignedByGitHub
      }
      status { contexts { context description createdAt } id state }
    }
    `;
  }
}

export default new CommitFragment();
