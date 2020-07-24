/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment reviewDismissedEvent on ReviewDismissedEvent {
  actor { ...actor }
  createdAt
  databaseId
  dismissalMessage
  previousReviewState
  pullRequestCommit { id commit { ...commit } url }
  review { id }
  url
}`;
