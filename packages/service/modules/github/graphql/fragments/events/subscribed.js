/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment subscribedEvent on SubscribedEvent {
  actor { ...actor }
  createdAt
}`;
