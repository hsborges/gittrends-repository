/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment mentionedEvent on MentionedEvent {
  actor { ...actor }
  createdAt
}`;
