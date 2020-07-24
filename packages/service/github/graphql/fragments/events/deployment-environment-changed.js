/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment deploymentEnvChangedEvent on DeploymentEnvironmentChangedEvent {
  actor { ...actor }
  createdAt
  deploymentStatus { ...deploymentStatus }
}`;
