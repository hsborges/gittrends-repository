/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment milestonedEvent on MilestonedEvent {
  actor { ...actor }
  createdAt
  milestoneTitle
}`;
