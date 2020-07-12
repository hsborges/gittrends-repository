/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment addedToProjectEvent on AddedToProjectEvent {
  actor { ...actor }
  createdAt
  project { id }
  projectCard { id }
  projectColumnName 
}`;
