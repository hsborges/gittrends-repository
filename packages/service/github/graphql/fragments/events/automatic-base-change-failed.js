/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment automaticBaseChangeFailedEvent on AutomaticBaseChangeFailedEvent {
  actor { ...actor }
  createdAt
  newBase
  oldBase
}`;
