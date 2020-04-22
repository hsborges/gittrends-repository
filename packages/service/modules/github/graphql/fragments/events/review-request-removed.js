/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment reviewRequestRemovedEvent on ReviewRequestRemovedEvent {
  actor { ...actor }
  createdAt
  requestedReviewer { ...actor }
}`;
