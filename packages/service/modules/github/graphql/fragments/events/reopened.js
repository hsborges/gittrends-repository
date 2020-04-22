/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment reopenedEvent on ReopenedEvent {
  actor { ...actor }
  createdAt
}`;
