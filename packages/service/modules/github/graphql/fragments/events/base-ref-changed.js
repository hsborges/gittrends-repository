/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment baseRefChangedEvent on BaseRefChangedEvent {
  actor { ...actor }
  createdAt
}`;
