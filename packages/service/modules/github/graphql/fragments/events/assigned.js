/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment assignedEvent on AssignedEvent {
  actor { ...actor }
  assignee { ...actor }
  createdAt
}`;
