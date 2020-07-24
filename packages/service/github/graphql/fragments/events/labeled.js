/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment labeledEvent on LabeledEvent {
  actor { ...actor }
  createdAt
  label { name }
}`;
