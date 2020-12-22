const IssueFragment = require('./IssueFragment');
const ActorFragment = require('./ActorFragment').simplified;
const CommitFragment = require('./CommitFragment');

module.exports = class PullRequestFragment extends IssueFragment {
  static get objectName() {
    return 'PullRequest';
  }

  static get code() {
    return 'pull';
  }

  static get simplified() {
    const fragment = new PullRequestFragment();
    fragment.code = 'sPull';
    fragment.dependencies = [ActorFragment];
    fragment.objectName = PullRequestFragment.objectName;
    fragment.toString = () => PullRequestFragment.toString.bind(fragment)(false);
    return fragment;
  }

  static get dependencies() {
    return super.dependencies.concat([ActorFragment, CommitFragment]);
  }

  static toString(full = true) {
    return super.toString(
      full,
      `
      baseRefName
      isCrossRepository
      merged
      mergedAt
      additions
      ${super.$include(full, `baseRef { name target { ...${CommitFragment.code} } }`)}
      ${super.$include(full, 'baseRefOid')}
      ${super.$include(full, 'baseRepository { id }')}
      ${super.$include(full, 'canBeRebased')}
      ${super.$include(full, 'changedFiles')}
      ${super.$include(full, 'deletions')}
      ${super.$include(full, `headRef { name target { ...${CommitFragment.code} } }`)}
      ${super.$include(full, 'headRefName')}
      ${super.$include(full, 'headRefOid')}
      ${super.$include(full, 'headRepository { id }')}
      ${super.$include(full, `headRepositoryOwner { ...${ActorFragment.code} }`)}
      ${super.$include(full, 'isDraft')}
      ${super.$include(full, 'maintainerCanModify')}
      ${super.$include(full, `mergeCommit { ...${CommitFragment.code} }`)}
      ${super.$include(full, 'mergeStateStatus')}
      ${super.$include(full, 'mergeable')}
      ${super.$include(full, `mergedBy { ...${ActorFragment.code} }`)}
      ${super.$include(full, 'permalink')}
      ${super.$include(full, `potentialMergeCommit { ...${CommitFragment.code} }`)}
      `
    );
  }
};
