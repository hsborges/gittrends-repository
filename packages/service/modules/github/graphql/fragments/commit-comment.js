/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment commitComment on CommitComment {
  type:__typename
  id
  ... on Comment { ...comment }
  commit { ...commit }
  databaseId
  path
  position
  ...reaction
}
`;
