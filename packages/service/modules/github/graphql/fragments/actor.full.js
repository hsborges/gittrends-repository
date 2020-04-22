/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment actor on Actor {
  avatarUrl login type:__typename
  ... on Node { id }
  ... on User {
    anyPinnableItems
    bio
    company
    # contributionsCollection
    createdAt
    databaseId
    email
    # gist
    # hovercard
    isBountyHunter
    isCampusExpert
    isDeveloperProgramMember
    isEmployee
    isHireable
    isSiteAdmin
    #itemShowcase
    location
    name
    # organization  { id databaseId login }
    pinnedItemsRemaining
    status { id createdAt emoji expiresAt indicatesLimitedAvailability message updatedAt }
    updatedAt
    websiteUrl

    # Connections
    followers { totalCount }
    following { totalCount }
    gists { totalCount }
    pinnedItems { totalCount }
    repositories { totalCount }
    starredRepositories { totalCount }
    watching { totalCount }
  }
  ... on Organization {
    anyPinnableItems
    createdAt
    databaseId
    description
    email
    isVerified
    location
    name
    # organizationBillingEmail
    updatedAt
    websiteUrl
    # connections
    membersWithRole { totalCount }
    repositories(privacy: PUBLIC) { totalCount }
    teams { totalCount }
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
}
`;
