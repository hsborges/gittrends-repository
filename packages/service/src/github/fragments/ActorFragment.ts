/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';

class Actor extends Fragment {
  code = 'actor';
  full = true;

  constructor(simplified = false) {
    super();
    if (simplified) {
      this.code = 'sActor';
      this.full = !simplified;
    }
  }

  toString() {
    return `
    fragment ${this.code} on Actor {
      avatarUrl login type:__typename
      ... on Node { id }
      ... on User {
        ${Fragment.include(this.full, 'bio')}
        ${Fragment.include(this.full, 'company')}
        createdAt
        databaseId
        email
        ${Fragment.include(this.full, 'followers { totalCount }')}
        ${Fragment.include(this.full, 'following { totalCount }')}
        ${Fragment.include(this.full, 'gists { totalCount }')}
        ${Fragment.include(this.full, 'isBountyHunter')}
        ${Fragment.include(this.full, 'isCampusExpert')}
        ${Fragment.include(this.full, 'isDeveloperProgramMember')}
        ${Fragment.include(this.full, 'isEmployee')}
        ${Fragment.include(this.full, 'isHireable')}
        ${Fragment.include(this.full, 'isSiteAdmin')}
        location
        name
        ${Fragment.include(this.full, 'projects { totalCount }')}
        ${Fragment.include(this.full, 'projectsUrl')}
        ${Fragment.include(this.full, 'repositories { totalCount }')}
        ${Fragment.include(this.full, 'repositoriesContributedTo { totalCount }')}
        ${Fragment.include(this.full, 'starredRepositories { totalCount }')}
        ${Fragment.include(
          this.full,
          'status { id createdAt emoji expiresAt indicatesLimitedAvailability message updatedAt }'
        )}
        twitterUsername
        updatedAt
        ${Fragment.include(this.full, 'watching { totalCount }')}
        websiteUrl
      }
      ... on Organization {
        createdAt
        databaseId
        ${Fragment.include(this.full, 'description')}
        email
        ${Fragment.include(this.full, 'isVerified')}
        location
        ${Fragment.include(this.full, 'membersWithRole { totalCount }')}
        name
        ${Fragment.include(this.full, 'repositories(privacy: PUBLIC) { totalCount }')}
        ${Fragment.include(this.full, 'teams { totalCount }')}
        twitterUsername
        updatedAt
        websiteUrl
      }
      ... on Mannequin {
        createdAt
        databaseId
        email
        updatedAt
      }
      ... on Bot {
        createdAt
        databaseId
        updatedAt
      }
      ... on EnterpriseUserAccount {
        createdAt
        name
        updatedAt
        user { id }
      }
    }
    `;
  }
}

export default new Actor(false);
export const SimplifiedActorFragment = new Actor(true);
