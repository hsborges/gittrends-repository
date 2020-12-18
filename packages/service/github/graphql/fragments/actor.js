/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment actor on Actor {
  avatarUrl login type:__typename
  ... on Node { id }
  ... on User {
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
    email
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
    name
    updatedAt
    user { id }
  }
}
`;
