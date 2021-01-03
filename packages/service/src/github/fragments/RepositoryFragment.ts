/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';

class Repository extends Fragment {
  code = 'repo';
  full = true;

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  constructor(simplified = true) {
    super();
    if ((this.full = !simplified)) this.code = 'sRepo';
  }

  toString() {
    return `
    fragment ${this.code} on Repository {
      ${Fragment.include(this.full, 'assignableUsers { totalCount }')}
      ${Fragment.include(this.full, 'codeOfConduct { name }')}
      createdAt
      databaseId
      defaultBranch:defaultBranchRef { name }
      ${Fragment.include(this.full, 'deleteBranchOnMerge')}
      description
      ${Fragment.include(this.full, 'diskUsage')}
      forksCount:forkCount
      ${Fragment.include(this.full, 'fundingLinks { platform url }')}
      ${Fragment.include(this.full, 'hasIssuesEnabled')}
      ${Fragment.include(this.full, 'hasProjectsEnabled')}
      ${Fragment.include(this.full, 'hasWikiEnabled')}
      ${Fragment.include(this.full, 'homepageUrl')}
      id
      ${Fragment.include(this.full, 'isArchived')}
      ${Fragment.include(this.full, 'isBlankIssuesEnabled')}
      ${Fragment.include(this.full, 'isDisabled')}
      ${Fragment.include(this.full, 'isEmpty')}
      ${Fragment.include(this.full, 'isFork')}
      ${Fragment.include(this.full, 'isInOrganization')}
      ${Fragment.include(this.full, 'isLocked')}
      ${Fragment.include(this.full, 'isMirror')}
      ${Fragment.include(this.full, 'isPrivate')}
      ${Fragment.include(this.full, 'isSecurityPolicyEnabled')}
      ${Fragment.include(this.full, 'isTemplate')}
      ${Fragment.include(this.full, 'isUserConfigurationRepository')}
      ${Fragment.include(this.full, 'issues { totalCount }')}
      ${Fragment.include(this.full, 'labels { totalCount }')}
      ${Fragment.include(this.full, 'licenseInfo { name }')}
      ${Fragment.include(this.full, 'lockReason')}
      ${Fragment.include(this.full, 'mentionableUsers { totalCount }')}
      ${Fragment.include(this.full, 'mergeCommitAllowed')}
      ${Fragment.include(this.full, 'milestones { totalCount }')}
      ${Fragment.include(this.full, 'mirrorUrl')}
      name
      nameWithOwner
      ${Fragment.include(this.full, 'openGraphImageUrl')}
      owner { ...${SimplifiedActorFragment.code} }
      ${Fragment.include(this.full, 'parent { id }')}
      primaryLanguage { name }
      pushedAt
      ${Fragment.include(this.full, 'pullRequests { totalCount }')}
      ${Fragment.include(this.full, 'rebaseMergeAllowed')}
      ${Fragment.include(this.full, 'releases { totalCount }')}
      ${Fragment.include(this.full, 'squashMergeAllowed')}
      stargazersCount:stargazerCount
      ${Fragment.include(this.full, 'templateRepository { id }')}
      updatedAt
      ${Fragment.include(this.full, 'url')}
      ${Fragment.include(this.full, 'usesCustomOpenGraphImage')}
      ${Fragment.include(this.full, 'vulnerabilityAlerts { totalCount }')}
      ${Fragment.include(this.full, 'watchers { totalCount }')}
    }
    `;
  }
}

export default new Repository();
export const SimplifiedRepositoryFragment = new Repository(true);
