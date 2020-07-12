/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment disconnectedEvent on DisconnectedEvent {
  actor { ...actor }
  createdAt
  isCrossRepository
  source { 
    ... on Issue { id type:__typename }
    ... on PullRequest { id type:__typename }
  }
  subject {
    ... on Issue { id type:__typename }
    ... on PullRequest { id type:__typename }
  }
}`;
