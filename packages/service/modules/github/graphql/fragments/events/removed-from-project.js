/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment removedFromProjectEvent on RemovedFromProjectEvent {
  actor { ...actor }
  createdAt
  project { id }
  projectColumnName 
}`;
