const Fragment = require('../Fragment');
const ActorFragment = require('./SimplifiedActorFragment');

module.exports = class RepositoryFragment extends Fragment {
  static get code() {
    return 'repo';
  }

  static get dependencies() {
    return [ActorFragment];
  }

  static toString() {
    return `
    fragment ${this.code} on Repository {
      assignableUsers { totalCount }
      codeOfConduct { name }
      createdAt
      databaseId
      defaultBranch:defaultBranchRef { name }
      deleteBranchOnMerge
      description
      diskUsage
      forksCount:forkCount
      fundingLinks { platform url }
      hasIssuesEnabled
      hasProjectsEnabled
      hasWikiEnabled
      homepageUrl
      id
      isArchived
      isBlankIssuesEnabled
      isDisabled
      isEmpty
      isFork
      isInOrganization
      isLocked
      isMirror
      isPrivate
      isSecurityPolicyEnabled
      isTemplate
      isUserConfigurationRepository
      issues { totalCount }
      labels { totalCount }
      licenseInfo { name }
      lockReason
      mentionableUsers { totalCount }
      mergeCommitAllowed
      milestones { totalCount }
      mirrorUrl
      name
      nameWithOwner
      openGraphImageUrl
      owner { ...${ActorFragment.code} }
      parent { id }
      primaryLanguage { name }
      pushedAt
      pullRequests { totalCount }
      rebaseMergeAllowed
      releases { totalCount }
      squashMergeAllowed
      stargazersCount:stargazerCount
      templateRepository { id }
      updatedAt
      url
      usesCustomOpenGraphImage
      vulnerabilityAlerts { totalCount }
      watchers { totalCount }
    }
    `;
  }
};