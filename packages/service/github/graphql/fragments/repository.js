/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment repository on Repository {
  id
  databaseId
  name
  nameWithOwner
  owner { ...actor }
  description
  defaultBranch:defaultBranchRef { name }
  primaryLanguage { name }
  stargazersCount:stargazerCount
  forksCount:forkCount
  createdAt
  pushedAt
  updatedAt
}
`;
