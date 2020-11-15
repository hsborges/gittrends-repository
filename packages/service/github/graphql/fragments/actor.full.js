/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment actor on Actor {
  avatarUrl login type:__typename
  ... on Node { id }
  ... on User {
    bio
    company
    createdAt
    databaseId
    email
    followers { totalCount }
    following { totalCount }
    gists { totalCount }
    isBountyHunter
    isCampusExpert
    isDeveloperProgramMember
    isEmployee
    isHireable
    isSiteAdmin
    location
    name
    projects { totalCount }
    projectsUrl
    repositories { totalCount }
    repositoriesContributedTo { totalCount }
    starredRepositories { totalCount }
    status { id createdAt emoji expiresAt indicatesLimitedAvailability message updatedAt }
    twitterUsername
    updatedAt
    watching { totalCount }
    websiteUrl
  }
  ... on Organization {
    createdAt
    databaseId
    description
    email
    isVerified
    location
    membersWithRole { totalCount }
    name
    repositories(privacy: PUBLIC) { totalCount }
    teams { totalCount }
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
    # enterprise { id }
    name
    updatedAt
    user { id }
  }
}
`;
