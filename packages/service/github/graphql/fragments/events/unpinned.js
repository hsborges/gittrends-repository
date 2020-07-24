/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment unpinnedEvent on UnpinnedEvent {
  actor { ...actor }
  createdAt
}`;
