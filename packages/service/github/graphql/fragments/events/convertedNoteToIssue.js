/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment convertedNoteToIssueEvent on ConvertedNoteToIssueEvent {
  actor { ...actor }
  createdAt
  project { id }
  projectCard { id }
  projectColumnName
}`;
