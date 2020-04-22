/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment milestone on Milestone {
  creator { ...actor }
  description
  dueOn
  id
  number
  state
  title
  url
}`;
