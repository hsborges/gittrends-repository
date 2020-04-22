/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment headRefDeletedEvent on HeadRefDeletedEvent {
  actor { ...actor }
  createdAt
  # headRef { name target { id } }
  headRefName
}`;
