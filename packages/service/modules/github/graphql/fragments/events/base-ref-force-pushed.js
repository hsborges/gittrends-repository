/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment baseRefForcePushedEvent on BaseRefForcePushedEvent {
  actor { ...actor }
  afterCommit { ...commit }
  beforeCommit { ...commit }
  createdAt
  ref { name target { id } }
}`;
