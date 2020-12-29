/*
 *  Author: Hudson S. Borges
 */
const Fragment = require('../Fragment');
const ActorFragment = require('./ActorFragment').simplified;

module.exports = class RepositoryFragment extends Fragment {
  constructor(full = true) {
    super();
    this.toString = () => RepositoryFragment.toString(full);
  }

  static get code() {
    return 'repo';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString(full = true) {
    return `
    fragment ${this.code} on Repository {
      ${super.$include(full, 'assignableUsers { totalCount }')}
      ${super.$include(full, 'codeOfConduct { name }')}
      createdAt
      databaseId
      defaultBranch:defaultBranchRef { name }
      ${super.$include(full, 'deleteBranchOnMerge')}
      description
      ${super.$include(full, 'diskUsage')}
      forksCount:forkCount
      ${super.$include(full, 'fundingLinks { platform url }')}
      ${super.$include(full, 'hasIssuesEnabled')}
      ${super.$include(full, 'hasProjectsEnabled')}
      ${super.$include(full, 'hasWikiEnabled')}
      ${super.$include(full, 'homepageUrl')}
      id
      ${super.$include(full, 'isArchived')}
      ${super.$include(full, 'isBlankIssuesEnabled')}
      ${super.$include(full, 'isDisabled')}
      ${super.$include(full, 'isEmpty')}
      ${super.$include(full, 'isFork')}
      ${super.$include(full, 'isInOrganization')}
      ${super.$include(full, 'isLocked')}
      ${super.$include(full, 'isMirror')}
      ${super.$include(full, 'isPrivate')}
      ${super.$include(full, 'isSecurityPolicyEnabled')}
      ${super.$include(full, 'isTemplate')}
      ${super.$include(full, 'isUserConfigurationRepository')}
      ${super.$include(full, 'issues { totalCount }')}
      ${super.$include(full, 'labels { totalCount }')}
      ${super.$include(full, 'licenseInfo { name }')}
      ${super.$include(full, 'lockReason')}
      ${super.$include(full, 'mentionableUsers { totalCount }')}
      ${super.$include(full, 'mergeCommitAllowed')}
      ${super.$include(full, 'milestones { totalCount }')}
      ${super.$include(full, 'mirrorUrl')}
      name
      nameWithOwner
      ${super.$include(full, 'openGraphImageUrl')}
      owner { ...${ActorFragment.code} }
      ${super.$include(full, 'parent { id }')}
      primaryLanguage { name }
      pushedAt
      ${super.$include(full, 'pullRequests { totalCount }')}
      ${super.$include(full, 'rebaseMergeAllowed')}
      ${super.$include(full, 'releases { totalCount }')}
      ${super.$include(full, 'squashMergeAllowed')}
      stargazersCount:stargazerCount
      ${super.$include(full, 'templateRepository { id }')}
      updatedAt
      ${super.$include(full, 'url')}
      ${super.$include(full, 'usesCustomOpenGraphImage')}
      ${super.$include(full, 'vulnerabilityAlerts { totalCount }')}
      ${super.$include(full, 'watchers { totalCount }')}
    }
    `;
  }
};
