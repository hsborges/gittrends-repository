/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment headRefRestoredEvent on HeadRefRestoredEvent {
  actor { ...actor }
  createdAt
}`;
