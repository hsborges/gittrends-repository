/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment demilestonedEvent on DemilestonedEvent {
  actor { ...actor }
  createdAt
  milestoneTitle
}`;
