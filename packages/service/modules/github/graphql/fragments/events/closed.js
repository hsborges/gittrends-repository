/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment closedEvent on ClosedEvent {
  actor { ...actor }
  closer { type:__typename ... on Node { id } }
  createdAt
}`;
