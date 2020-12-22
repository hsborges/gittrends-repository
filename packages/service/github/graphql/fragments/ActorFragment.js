const Fragment = require('../Fragment');

module.exports = class ActorFragment extends Fragment {
  static get code() {
    return 'actor';
  }

  static get dependencies() {
    return [];
  }

  static get simplified() {
    const fragment = new ActorFragment(false);
    fragment.code = 'sActor';
    fragment.toString = () => ActorFragment.toString.bind(fragment)(false);
    return fragment;
  }

  static toString(full = true) {
    return `
    fragment ${this.code} on Actor {
      avatarUrl login type:__typename
      ... on Node { id }
      ... on User {
        ${super.$include(full, 'bio')}
        ${super.$include(full, 'company')}
        createdAt
        databaseId
        email
        ${super.$include(full, 'followers { totalCount }')}
        ${super.$include(full, 'following { totalCount }')}
        ${super.$include(full, 'gists { totalCount }')}
        ${super.$include(full, 'isBountyHunter')}
        ${super.$include(full, 'isCampusExpert')}
        ${super.$include(full, 'isDeveloperProgramMember')}
        ${super.$include(full, 'isEmployee')}
        ${super.$include(full, 'isHireable')}
        ${super.$include(full, 'isSiteAdmin')}
        location
        name
        ${super.$include(full, 'projects { totalCount }')}
        ${super.$include(full, 'projectsUrl')}
        ${super.$include(full, 'repositories { totalCount }')}
        ${super.$include(full, 'repositoriesContributedTo { totalCount }')}
        ${super.$include(full, 'starredRepositories { totalCount }')}
        ${super.$include(
          full,
          'status { id createdAt emoji expiresAt indicatesLimitedAvailability message updatedAt }'
        )}
        twitterUsername
        updatedAt
        ${super.$include(full, 'watching { totalCount }')}
        websiteUrl
      }
      ... on Organization {
        createdAt
        databaseId
        ${super.$include(full, 'description')}
        email
        ${super.$include(full, 'isVerified')}
        location
        ${super.$include(full, 'membersWithRole { totalCount }')}
        name
        ${super.$include(full, 'repositories(privacy: PUBLIC) { totalCount }')}
        ${super.$include(full, 'teams { totalCount }')}
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
