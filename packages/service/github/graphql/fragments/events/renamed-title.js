/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment renamedTitleEvent on RenamedTitleEvent {
  actor { ...actor }
  createdAt
  currentTitle
  previousTitle
}`;
