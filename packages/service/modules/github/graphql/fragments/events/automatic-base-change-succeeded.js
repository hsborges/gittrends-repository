/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment automaticBaseChangeSucceededEvent on AutomaticBaseChangeSucceededEvent {
  actor { ...actor }
  createdAt
  newBase
  oldBase
}`;
