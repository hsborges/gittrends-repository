import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';
import CommitFragment from './CommitFragment';
import { IssueFragment } from './IssueFragment';

export class PullRequestFragment extends IssueFragment {
  code = 'pull';

  constructor(simplified = false) {
    super(simplified);
    this.code = 'sPull';
  }

  get dependencies(): Fragment[] {
    if (this.full) return super.dependencies.concat([CommitFragment, SimplifiedActorFragment]);
    return super.dependencies;
  }

  get additionalProperties(): string {
    return `
    baseRefName
      isCrossRepository
      merged
      mergedAt
      additions
      ${Fragment.include(this.full, `baseRef { name target { ...${CommitFragment.code} } }`)}
      ${Fragment.include(this.full, 'baseRefOid')}
      ${Fragment.include(this.full, 'baseRepository { id }')}
      ${Fragment.include(this.full, 'canBeRebased')}
      ${Fragment.include(this.full, 'changedFiles')}
      ${Fragment.include(this.full, 'deletions')}
      ${Fragment.include(this.full, `headRef { name target { ...${CommitFragment.code} } }`)}
      ${Fragment.include(this.full, 'headRefName')}
      ${Fragment.include(this.full, 'headRefOid')}
      ${Fragment.include(this.full, 'headRepository { id }')}
      ${Fragment.include(this.full, `headRepositoryOwner { ...${SimplifiedActorFragment.code} }`)}
      ${Fragment.include(this.full, 'isDraft')}
      ${Fragment.include(this.full, 'maintainerCanModify')}
      ${Fragment.include(this.full, `mergeCommit { ...${CommitFragment.code} }`)}
      ${Fragment.include(this.full, 'mergeStateStatus')}
      ${Fragment.include(this.full, 'mergeable')}
      ${Fragment.include(this.full, `mergedBy { ...${SimplifiedActorFragment.code} }`)}
      ${Fragment.include(this.full, 'permalink')}
      ${Fragment.include(this.full, `potentialMergeCommit { ...${CommitFragment.code} }`)}

    `;
  }
}

export default new PullRequestFragment();
export const SimplifiedPullRequest = new PullRequestFragment(true);
