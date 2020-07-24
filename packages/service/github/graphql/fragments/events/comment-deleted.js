/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment commentDeletedEvent on CommentDeletedEvent {
  actor { ...actor }
  createdAt
}`;
