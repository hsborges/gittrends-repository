/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment markedAsDuplicateEvent on MarkedAsDuplicateEvent {
  actor { ...actor }
  createdAt
}`;
