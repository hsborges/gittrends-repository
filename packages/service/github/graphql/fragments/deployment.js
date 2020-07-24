/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment deployment on Deployment {
  commit { ...commit }
  createdAt
  creator { ...actor }
  databaseId
  environment
  id
  payload
  state
  statuses (last: 100) {
    nodes {
      creator { ...actor }
      description
      environmentUrl
      id
      logUrl
      state
    }
  }
}`;
