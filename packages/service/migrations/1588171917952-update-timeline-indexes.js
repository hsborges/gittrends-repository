/*
 *  Author: Hudson S. Borges
 */
const connection = require('../modules/connection.js');

module.exports.up = async function () {
  if (!connection.isConnected) await connection.connect();
  await connection.timeline.dropIndex('repository_1_issue_1');
  await connection.timeline.dropIndex('repository_1_pull_1');
  await connection.timeline.createIndexes([{ key: { repository: 1 } }]);
  return connection.disconnect();
};

module.exports.down = async function () {
  if (!connection.isConnected) await connection.connect();
  await connection.timeline.dropIndex('repository_1_issue_1');
  await connection.timeline.dropIndex('repository_1_pull_1');
  await connection.timeline.createIndexes([
    { key: { repository: 1, issue: 1 } },
    { key: { repository: 1, pull: 1 } }
  ]);
  return connection.disconnect();
};
