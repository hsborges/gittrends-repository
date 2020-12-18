const Fragment = require('../Fragment');

module.exports = class ActorFragment extends Fragment {
  constructor(full = false) {
    super();
    this.full = full;
  }

  static get code() {
    return 'actor';
  }

  get dependencies() {
    return [];
  }

  toString() {
    return `
    fragment ${ActorFragment.code} on Actor {
      avatarUrl login type:__typename
      ... on Node { id }
      ... on User {
        ${super.$include('bio')}
        ${super.$include('company')}
        createdAt
        databaseId
        email
        ${super.$include('followers { totalCount }')}
        ${super.$include('following { totalCount }')}
        ${super.$include('gists { totalCount }')}
        ${super.$include('isBountyHunter')}
        ${super.$include('isCampusExpert')}
        ${super.$include('isDeveloperProgramMember')}
        ${super.$include('isEmployee')}
        ${super.$include('isHireable')}
        ${super.$include('isSiteAdmin')}
        location
        name
        ${super.$include('projects { totalCount }')}
        ${super.$include('projectsUrl')}
        ${super.$include('repositories { totalCount }')}
        ${super.$include('repositoriesContributedTo { totalCount }')}
        ${super.$include('starredRepositories { totalCount }')}
        ${super.$include(
          'status { id createdAt emoji expiresAt indicatesLimitedAvailability message updatedAt }'
        )}
        twitterUsername
        updatedAt
        ${super.$include('watching { totalCount }')}
        websiteUrl
      }
      ... on Organization {
        createdAt
        databaseId
        ${super.$include('description')}
        email
        ${super.$include('isVerified')}
        location
        ${super.$include('membersWithRole { totalCount }')}
        name
        ${super.$include('repositories(privacy: PUBLIC) { totalCount }')}
        ${super.$include('teams { totalCount }')}
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
};
