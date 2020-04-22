/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment issueComment on IssueComment {
  ... on Comment { ...comment }
  # bodyText
  lastEditedAt
  publishedAt
  isMinimized
  minimizedReason
  ...reaction
}`;
