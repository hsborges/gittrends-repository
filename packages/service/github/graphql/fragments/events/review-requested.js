/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment reviewRequestedEvent on ReviewRequestedEvent {
  actor { ...actor }
  createdAt
  requestedReviewer { ...actor }
}`;
