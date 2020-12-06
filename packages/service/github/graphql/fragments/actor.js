/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment actor on Actor {
  avatarUrl login type:__typename
  ... on Node { id }
  ... on User {
    # bio
    # company
    createdAt
    databaseId
    email
    location
    name
    twitterUsername
    updatedAt
    websiteUrl
  }
  ... on Organization {
    createdAt
    databaseId
    # description
    email
    # isVerified
    location
    name
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
