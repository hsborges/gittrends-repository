/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment unassignedEvent on UnassignedEvent {
  actor { ...actor }
  assignee { ...actor }
  createdAt
}`;
