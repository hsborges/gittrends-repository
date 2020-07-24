/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment commitCommentThread on CommitCommentThread {
  type:__typename
  comments(first: 100) { nodes { ...commitComment } }
  commit { ...commit }
  path
  position
}`;
