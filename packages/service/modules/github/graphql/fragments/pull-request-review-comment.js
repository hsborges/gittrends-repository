/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment pullRequestReviewComment on PullRequestReviewComment {
  id
  type:__typename
  ... on Comment { ...comment }
  commit { ...commit }
  databaseId
  diffHunk
  draftedAt
  isMinimized
  minimizedReason
  originalCommit { ...commit }
  originalPosition
  outdated
  path
  position
  ...reaction
  replyTo { id }
  state
  url
}
`;
