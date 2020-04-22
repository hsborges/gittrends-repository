/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment unlabeledEvent on UnlabeledEvent {
  actor { ...actor }
  createdAt
  label { name }
}`;
