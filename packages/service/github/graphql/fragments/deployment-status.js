/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment deploymentStatus on DeploymentStatus {
  createdAt
  creator { ...actor }
  deployment { ...deployment }
  description
  logUrl
  state
  updatedAt
}`;
