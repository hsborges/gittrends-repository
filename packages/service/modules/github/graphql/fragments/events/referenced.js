/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment referencedEvent on ReferencedEvent {
  actor { ...actor }
  commit { ...commit }
  commitRepository { ...repo }
  createdAt
  isCrossRepository
  isDirectReference
}`;
