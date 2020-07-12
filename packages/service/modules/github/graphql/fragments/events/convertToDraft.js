/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment convertToDraftEvent on ConvertToDraftEvent {
  actor { ...actor }
  createdAt
}`;
