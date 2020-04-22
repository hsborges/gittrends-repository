/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment crossReferencedEvent on CrossReferencedEvent {
  actor { ...actor }
  createdAt
  isCrossRepository
  referencedAt
  source { type:__typename ... on Node { id } }
  target { type:__typename ... on Node { id } }
  url
  willCloseTarget
}`;
