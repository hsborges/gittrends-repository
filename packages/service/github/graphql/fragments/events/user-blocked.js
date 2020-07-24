/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment userBlockedEvent on UserBlockedEvent {
  actor { ...actor }
  blockDuration
  createdAt
  subject { ...actor }
}`;
