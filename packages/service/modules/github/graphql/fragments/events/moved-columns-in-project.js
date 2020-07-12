/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment movedColumnsInProjectEvent on MovedColumnsInProjectEvent {
  actor { ...actor }
  createdAt
  previousProjectColumnName
  project { id }
  projectCard { id }
  projectColumnName
}`;
