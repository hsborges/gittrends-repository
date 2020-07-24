/*
 *  Author: Hudson S. Borges
 */
module.exports = `fragment deployedEvent on DeployedEvent {
  actor { ...actor }
  createdAt
  databaseId
  deployment { ...deployment }
  ref { name target { id } }
}`;
