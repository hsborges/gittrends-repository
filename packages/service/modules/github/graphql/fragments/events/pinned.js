/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment pinnedEvent on PinnedEvent {
  actor { ...actor }
  createdAt
}`;
