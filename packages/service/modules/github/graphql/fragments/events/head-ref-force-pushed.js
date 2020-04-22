/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment headRefForcePushedEvent on HeadRefForcePushedEvent {
  actor { ...actor }
  afterCommit { ...commit }
  beforeCommit { ...commit }
  createdAt
  ref { name target { id } }
}`;
