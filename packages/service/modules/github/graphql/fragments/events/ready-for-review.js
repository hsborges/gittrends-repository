/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment readyForReviewEvent on ReadyForReviewEvent {
  actor { ...actor }
  createdAt
}`;
