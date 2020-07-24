/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment reaction on Reactable {
  reactionGroups {
    content
    createdAt
    users { totalCount }
  }
}`;
