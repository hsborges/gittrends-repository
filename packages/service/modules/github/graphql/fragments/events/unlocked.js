/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment unlockedEvent on UnlockedEvent {
  actor { ...actor }
  createdAt
}`;
