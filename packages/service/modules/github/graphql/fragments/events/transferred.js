/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment transferredEvent on TransferredEvent {
  actor { ...actor }
  createdAt
  fromRepository { id nameWithOwner }
}`;
