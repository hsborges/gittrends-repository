/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment lockedEvent on LockedEvent {
  actor { ...actor }
  createdAt
  lockReason
}`;
