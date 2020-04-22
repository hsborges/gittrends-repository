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
  stargazers { totalCount }
  forks { totalCount }
  createdAt
  pushedAt
  updatedAt
}
`;
